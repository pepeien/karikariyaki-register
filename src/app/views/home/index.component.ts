import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { io } from 'socket.io-client';
import { ApiResponseWrapper, Event } from 'karikarihelper';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
	selector: 'app-home-view',
	templateUrl: './index.component.html',
})
export class HomeViewComponent implements OnInit {
	/**
	 * Primitives
	 */
	public willCreateEvent = false;

	/**
	 * Forms
	 */
	public eventRegistryForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
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

	ngOnInit(): void {
		this._socket.on('events', (response) => {
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
	}

	public onEventClick(event: Event) {
		this._socket.emit('event-clock-in', event._id);

		this._socket.on('event-clock-in', (response) => {
			const serializedResponse = response as ApiResponseWrapper<Event>;

			if (!serializedResponse.wasSuccessful || !serializedResponse.result) {
				return;
			}
		});
	}
}
