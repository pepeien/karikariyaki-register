import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AnimationEvent } from '@angular/animations';
import { io } from 'socket.io-client';
import { ApiResponseWrapper, Event } from 'karikarihelper';

// Animations
import { BasicAnimations } from '@animations';
import { ApiService } from '@services';

@Component({
	selector: 'app-home-view',
	templateUrl: './index.component.html',
	animations: [BasicAnimations.breatheAnimation, BasicAnimations.horizontalShrinkAnimation],
})
export class HomeViewComponent implements OnInit {
	/**
	 * Primitives
	 */
	public willCreateEvent = false;
	public isHandshaking = true;

	/**
	 * Animations
	 */
	public logoBreatheAnimationState: 'inhale' | 'exhale' = 'inhale';
	public creationAnimationState: 'min' | 'max' = 'min';

	/**
	 * Forms
	 */
	public eventRegistryForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		date: new FormControl(new Date(), [Validators.required]),
	});

	/**
	 * Socket IO
	 */
	private _socket = io('ws://192.168.15.188:9006/reji', {
		withCredentials: true,
	});

	/**
	 * In House
	 */
	public availableEvents: Event[] = [];
	public pastEvents: Event[] = [];
	public currentEvents: Event[] = [];
	public futureEvents: Event[] = [];

	constructor(private _apiService: ApiService) {}

	ngOnInit(): void {
		this.isHandshaking = true;

		this._socket.emit('sign-in');

		this._socket.on('sign-in', (response) => {
			this.isHandshaking = false;

			const serializedResponse = response as ApiResponseWrapper<Event[]>;

			if (!serializedResponse.wasSuccessful || !serializedResponse.result) {
				return;
			}

			this.availableEvents = serializedResponse.result;

			const currentBroadDate = new Date();

			currentBroadDate.setHours(0, 0, 0, 0);

			this.pastEvents = this.availableEvents.filter(
				(event) => new Date(event.date).getTime() < currentBroadDate.getTime(),
			);
			this.currentEvents = this.availableEvents.filter(
				(event) => new Date(event.date).getTime() === currentBroadDate.getTime(),
			);
			this.futureEvents = this.availableEvents.filter(
				(event) => new Date(event.date).getTime() > currentBroadDate.getTime(),
			);
		});

		this._socket.on('event-clock-in', (response) => {
			const serializedResponse = response as ApiResponseWrapper<Event>;

			if (!serializedResponse.wasSuccessful || !serializedResponse.result) {
				return;
			}
		});
	}

	public initEventCreation() {
		this.eventRegistryForm.reset();

		this.eventRegistryForm.controls.date.setValue(new Date());

		this.creationAnimationState = 'max';
	}

	public isEventCreationInvalid() {
		return (
			this.eventRegistryForm.invalid || this.isHandshaking || this.willCreateEvent === false
		);
	}
	public cancelEventCreation() {
		this.eventRegistryForm.reset();

		this.creationAnimationState = 'min';
	}

	public onCreationAnimation(event: AnimationEvent) {
		this.willCreateEvent = event.toState.trim().toLocaleLowerCase() === 'max';
	}

	public onEventCreation() {
		if (this.isEventCreationInvalid()) {
			return;
		}

		this._apiService.V1.eventRegistry
			.save({
				name: this.eventRegistryForm.controls.name.value as string,
				date: this.eventRegistryForm.controls.date.value as Date,
			})
			.subscribe({
				next: (response) => {
					if (response.wasSuccessful === false || !response.result) {
						return;
					}

					this.cancelEventCreation();
				},
			});
	}

	public onEventClick(event: Event) {
		this._socket.emit('event-clock-in', event._id);
	}

	public onLogoBreatheAnimationDone() {
		if (!this.logoBreatheAnimationState || this.isHandshaking === false) {
			return;
		}

		this.logoBreatheAnimationState =
			this.logoBreatheAnimationState === 'inhale' ? 'exhale' : 'inhale';
	}
}
