import { Component, Input, OnInit } from '@angular/core';
import { OrderStatus } from 'karikarihelper';

// Animations
import { AutomaticAnimation } from '@animations';

// Service
import { ApiService, LanguageService } from '@services';

@Component({
	selector: 'app-order-status',
	templateUrl: './index.component.html',
	animations: [AutomaticAnimation.pop, AutomaticAnimation.slideFromLeft],
})
export class OrderStatusComponent implements OnInit {
	@Input()
	public status: string = '';

	/**
	 * Primitives
	 */
	public availableOrderStatus: string[] = [];

	/**
	 * Language
	 */
	public languageSource = LanguageService.DEFAULT_LANGUAGE;

	constructor(private _apiService: ApiService, private _languageService: LanguageService) {}

	ngOnInit(): void {
		this._apiService.V1.eventOrderRegistry.status().subscribe({
			next: (response) => {
				if (response.wasSuccessful === false || !response.result) {
					return;
				}

				this.availableOrderStatus = response.result;
			},
		});

		this._languageService.language.subscribe({
			next: (nextLanguage) => {
				this.languageSource = nextLanguage;
			},
		});
	}

	public isCooking(): boolean {
		return this.status.trim() === OrderStatus.COOKING;
	}

	public isReady(): boolean {
		return this.status.trim() === OrderStatus.READY;
	}

	public isPickedUp(): boolean {
		return this.status.trim() === OrderStatus.PICKED_UP;
	}
}
