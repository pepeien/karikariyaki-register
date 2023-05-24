import { Component, OnInit } from '@angular/core';
import { Event } from 'karikarihelper';

// Animations
import { BasicAnimations } from '@animations';

// Services
import { EventsService, LanguageService, LoadingService } from '@services';

@Component({
	selector: 'app-event-view',
	templateUrl: './index.component.html',
	animations: [BasicAnimations.breatheAnimation, BasicAnimations.horizontalShrinkAnimation],
})
export class EventViewComponent implements OnInit {
	/**
	 * Primitives
	 */
	public isLoading = false;

	/**
	 * Language
	 */
	public selectedLanguage = LanguageService.DEFAULT_LANGUAGE;

	/**
	 * In House
	 */
	public selectedEvent: Event | null = null;

	constructor(
		private _eventService: EventsService,
		private _languageService: LanguageService,
		private _loadingService: LoadingService,
	) {}

	ngOnInit(): void {
		this._eventService.selectedEvent.subscribe({
			next: (nextEvent) => {
				this._loadingService.updateLoading(false);

				this.selectedEvent = nextEvent;
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
}
