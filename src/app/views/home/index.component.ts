import { AnimationEvent } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Event } from 'karikarihelper';

// Animations
import { AutomaticAnimation, BasicAnimations } from '@animations';

// Services
import { EventsService, LanguageService, LoadingService, SocketService } from '@services';

@Component({
	selector: 'app-home-view',
	templateUrl: './index.component.html',
	animations: [
		AutomaticAnimation.slideToLeft,
		BasicAnimations.breatheAnimation,
		BasicAnimations.horizontalShrinkAnimation,
	],
})
export class HomeViewComponent implements OnInit {
	/**
	 * Primitives
	 */
	public willCreateEvent = false;
	public isLoading = false;

	/**
	 * Animations
	 */
	public creationAnimationState: 'min' | 'max' = 'min';

	/**
	 * Forms
	 */
	public eventRegistryForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		date: new FormControl(new Date(), [Validators.required]),
	});

	/**
	 * In House
	 */
	public availableEvents: Event[] = [];
	public pastEvents: Event[] = [];
	public currentEvents: Event[] = [];
	public futureEvents: Event[] = [];

	/**
	 * Language
	 */
	public selectedLanguage = LanguageService.DEFAULT_LANGUAGE;

	constructor(
		private _eventService: EventsService,
		private _languageService: LanguageService,
		private _loadingService: LoadingService,
		private _router: Router,
		private _socketService: SocketService,
	) {}

	ngOnInit(): void {
		this._setupSocket();

		this._eventService.availableEvents.subscribe({
			next: (nextEvents) => {
				this.cancelEventCreation();

				this.availableEvents = nextEvents;

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

				this._loadingService.updateLoading(false);
			},
		});

		this._languageService.language.subscribe({
			next: (nextLanguage) => {
				this.selectedLanguage = nextLanguage;
			},
		});

		this._loadingService.loading.subscribe({
			next: (nextLoading) => {
				this.isLoading = nextLoading;
			},
		});
	}

	public initEventCreation() {
		if (this.isLoading) {
			return;
		}

		this.eventRegistryForm.reset();

		this.eventRegistryForm.controls.date.setValue(new Date());

		this.creationAnimationState = 'max';
	}

	public isEventCreationInvalid() {
		return this.eventRegistryForm.invalid || this.isLoading || this.willCreateEvent === false;
	}

	public cancelEventCreation() {
		if (this.isLoading) {
			return;
		}

		this.eventRegistryForm.reset();

		this.creationAnimationState = 'min';
	}

	public onCreationAnimation(event: AnimationEvent) {
		if (this.isLoading) {
			return;
		}

		this.willCreateEvent = event.toState.trim().toLocaleLowerCase() === 'max';
	}

	public onEventCreation() {
		if (this.isEventCreationInvalid() || this.isLoading) {
			return;
		}

		this._socketService.socket.emit('event:create', {
			name: this.eventRegistryForm.controls.name.value as string,
			date: this.eventRegistryForm.controls.date.value as Date,
		});
	}

	public onEventClick(event: Event) {
		if (this.isLoading) {
			return;
		}

		this._socketService.socket.emit('event:join', event._id);

		this._loadingService.updateLoading(true);

		this._router.navigate(['event']);
	}

	private _setupSocket() {
		this._loadingService.updateLoading(true);

		this._eventService.updateSelectedEvent(null);

		this._socketService.socket.emit('events:join');
	}
}
