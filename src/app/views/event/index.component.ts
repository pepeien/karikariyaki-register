import { AnimationEvent } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	ApiResponseWrapper,
	Event,
	EventOrder,
	EventOrderCreatableParams,
	OrderStatus,
	Product,
} from 'karikarihelper';

// Animations
import { AutomaticAnimation, BasicAnimations } from '@animations';

// Services
import {
	ApiService,
	EventsService,
	LanguageService,
	LoadingService,
	SocketService,
} from '@services';

@Component({
	selector: 'app-event-view',
	templateUrl: './index.component.html',
	animations: [
		AutomaticAnimation.pop,
		AutomaticAnimation.slideFromLeft,
		AutomaticAnimation.slideFromRight,
		BasicAnimations.horizontalShrinkAnimation,
	],
})
export class EventViewComponent implements OnInit {
	/**
	 * Primitives
	 */
	public willCreateEventOrder = false;
	public isLoading = false;

	/**
	 * Animations
	 */
	public creationAnimationState: 'min' | 'max' = 'min';

	/**
	 * Forms
	 */
	public eventOrderRegistryForm = new FormGroup({
		client: new FormControl('', [Validators.required]),
		items: new FormControl({ value: '', disabled: true }, [Validators.required]),
	});

	/**
	 * Language
	 */
	public languageSource = LanguageService.DEFAULT_LANGUAGE;

	/**
	 * In House
	 */
	public availableProducts: Product[] = [];
	public selectedProducts: Product[] = [];
	public selectedEvent: Event | null = null;
	public pickedupOrders: EventOrder[] = [];
	public cookingOrders: EventOrder[] = [];
	public readyOrders: EventOrder[] = [];

	constructor(
		private _activedRoute: ActivatedRoute,
		private _apiService: ApiService,
		private _eventService: EventsService,
		private _languageService: LanguageService,
		private _loadingService: LoadingService,
		private _router: Router,
		private _socketService: SocketService,
	) {}

	ngOnInit(): void {
		const eventId = this._activedRoute.snapshot.paramMap.get('id');

		if (!eventId) {
			return;
		}

		this._socketService.socket.on('orders:refresh', (response) => {
			const serializedResponse = response as ApiResponseWrapper<EventOrder[]>;

			if (!serializedResponse.result || serializedResponse.result.length === 0) {
				this.pickedupOrders = [];
				this.cookingOrders = [];
				this.readyOrders = [];

				return;
			}

			for (const eventOrder of serializedResponse.result) {
				if (eventOrder.status === OrderStatus.PICKED_UP) {
					if (this._hasOrder(eventOrder, this.cookingOrders)) {
						this._removeOrder(eventOrder, this.cookingOrders);
					}

					if (this._hasOrder(eventOrder, this.readyOrders)) {
						this._removeOrder(eventOrder, this.readyOrders);
					}

					if (this._hasOrder(eventOrder, this.pickedupOrders) === false) {
						this.pickedupOrders.unshift(eventOrder);
					}

					continue;
				}

				if (eventOrder.status === OrderStatus.COOKING) {
					if (this._hasOrder(eventOrder, this.pickedupOrders)) {
						this._removeOrder(eventOrder, this.pickedupOrders);
					}

					if (this._hasOrder(eventOrder, this.readyOrders)) {
						this._removeOrder(eventOrder, this.readyOrders);
					}

					if (this._hasOrder(eventOrder, this.cookingOrders) === false) {
						this.cookingOrders.unshift(eventOrder);
					}

					continue;
				}

				if (eventOrder.status === OrderStatus.READY) {
					if (this._hasOrder(eventOrder, this.pickedupOrders)) {
						this._removeOrder(eventOrder, this.pickedupOrders);
					}

					if (this._hasOrder(eventOrder, this.cookingOrders)) {
						this._removeOrder(eventOrder, this.cookingOrders);
					}
					if (this._hasOrder(eventOrder, this.readyOrders) === false) {
						this.readyOrders.unshift(eventOrder);
					}

					continue;
				}
			}
		});

		this._eventService.selectedEvent.subscribe({
			next: (nextEvent) => {
				this.selectedEvent = nextEvent;

				this._loadingService.updateLoading(false);
			},
		});

		this._languageService.language.subscribe({
			next: (nextLanguage) => {
				this.languageSource = nextLanguage;
			},
		});

		this._loadingService.loading.subscribe({
			next: (nextLoading) => {
				this.isLoading = nextLoading;
			},
		});

		this._socketService.socket.emit('event:join', eventId);
	}

	public displayProductAutocomplete(product: Product) {
		if (!product) {
			return '';
		}

		return product.name;
	}

	public getSingleProducts(): Product[] {
		const currentItemsValue = this.eventOrderRegistryForm.controls.items.value;

		if (typeof currentItemsValue === 'string') {
			return [];
		}

		return currentItemsValue as unknown as Product[];
	}

	public initEventCreation() {
		if (this.isLoading) {
			return;
		}

		this.creationAnimationState = 'max';
	}

	public isEventOrderCreationInvalid() {
		return (
			this.eventOrderRegistryForm.invalid ||
			this.getSingleProducts().length === 0 ||
			this.isLoading ||
			this.willCreateEventOrder === false
		);
	}

	public onEventOrderCreation() {
		if (this.isEventOrderCreationInvalid() || this.isLoading) {
			return;
		}

		const extractedItemsIds: string[] = [];

		this.getSingleProducts().forEach((item) => {
			extractedItemsIds.push(item._id.toString());
		});

		this._socketService.socket.emit('orders:create', {
			itemsId: extractedItemsIds,
			clientName: this.eventOrderRegistryForm.controls.client.value as string,
		} as EventOrderCreatableParams);

		this.onCancelEvent();
	}

	public onCancelEvent() {
		if (this.isLoading) {
			return;
		}

		if (this.willCreateEventOrder) {
			this.creationAnimationState = 'min';

			return;
		}

		this._router.navigate(['/']);
	}

	public onCreationAnimation(event: AnimationEvent) {
		if (this.isLoading) {
			return;
		}

		this._updateAvailableProducts();

		this.willCreateEventOrder = event.toState.trim().toLocaleLowerCase() === 'max';
	}

	private _hasOrder(target: EventOrder, orderList: EventOrder[]): boolean {
		let hasEvent = false;

		for (const order of orderList) {
			if (order._id === target._id) {
				hasEvent = true;

				break;
			}
		}

		return hasEvent;
	}

	private _removeOrder(target: EventOrder, orderList: EventOrder[]) {
		const foundTargetIndex = orderList.findIndex((order) => order._id === target._id);

		if (foundTargetIndex === -1) {
			return;
		}

		orderList.splice(foundTargetIndex, 1);
	}

	private _updateAvailableProducts() {
		this._apiService.V1.productRegistry.search().subscribe({
			next: (response) => {
				if (response.wasSuccessful === false || !response.result) {
					return;
				}

				this.availableProducts = response.result;
			},
		});
	}
}
