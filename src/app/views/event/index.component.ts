import { AnimationEvent } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ApiResponseWrapper,
    Event,
    EventOrder,
    EventOrderCreatableParams,
    EventOrderEditableParams,
    Ingredient,
    OrderItem,
    OrderItemParam,
    OrderStatus,
    Product,
} from 'karikarihelper';
import { v4 } from 'uuid';

// Animations
import { AutomaticAnimation, BasicAnimations } from '@animations';

// Services
import {
    AlertService,
    ApiService,
    EventsService,
    LanguageService,
    LoadingService,
    SocketService,
} from '@services';

// Components
import { DialogComponent, OrderDetailComponent } from '@components';
import { MatStepper } from '@angular/material/stepper';

interface IdedOrderItem {
    id: string;
    data: OrderItem;
}

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
     * Consts
     */
    public readonly MIN_PRODUCT_COUNT = 1;
    public readonly MAX_PRODUCT_COUNT = 100;

    /**
     * Primitives
     */
    public willCreateEventOrder = false;
    public isLoading = false;

    public productCount = 1;

    /**
     * Angular
     */
    @ViewChild('stepper')
    public stepperRef!: MatStepper;

    /**
     * Animations
     */
    public creationAnimationState: 'min' | 'max' = 'min';

    /**
     * Forms
     */
    public eventOrderRegistryForm = new FormGroup({
        client: new FormControl('', [Validators.required]),
        items: new FormControl({ value: '', disabled: true }, []),
    });
    public eventOrderRegistryFormDummy = new FormGroup({
        client: new FormControl('', [Validators.required]),
        items: new FormControl({ value: '', disabled: true }, []),
    });

    /**
     * Language
     */
    public languageSource = LanguageService.DEFAULT_LANGUAGE;

    /**
     * In House
     */
    public selectedEvent: Event | null = null;
    public pickedupOrders: EventOrder[] = [];
    public cookingOrders: EventOrder[] = [];
    public readyOrders: EventOrder[] = [];
    public availableProducts: Product[] = [];
    public selectedProduct: Product | null = null;
    public selectedOptionalIngredients: Ingredient[] = [];
    public selectedAdditionalIngredients: Ingredient[] = [];
    public selectedItems: IdedOrderItem[] = [];

    constructor(
        private _alertService: AlertService,
        private _activedRoute: ActivatedRoute,
        private _apiService: ApiService,
        private _dialog: MatDialog,
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

        this._socketService.socket.on('event:error', (response) => {
            const serializedResponse = response.description as string[];

            serializedResponse.forEach((errorDescription) => {
                this._alertService.pushWarning(errorDescription);
            });
        });

        this._socketService.socket.on('order:error', (response) => {
            const serializedResponse = response.description as string[];

            serializedResponse.forEach((errorDescription) => {
                this._alertService.pushWarning(errorDescription);
            });
        });

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

    public initEventCreation() {
        if (this.isEventEditable() === false) {
            return;
        }

        this._resetInput();

        this.creationAnimationState = 'max';
    }

    public isEventOrderCreationInvalid() {
        return (
            this.eventOrderRegistryForm.invalid ||
            this.selectedItems.length === 0 ||
            this.isEventEditable() === false ||
            this.willCreateEventOrder === false
        );
    }

    public isEventEditable() {
        return this.isLoading === false && this.selectedEvent && this.selectedEvent.isOpen;
    }

    public onOptionalSelection(ingredients: Ingredient[]) {
        this.selectedOptionalIngredients = ingredients;
    }

    public onAdditionalSelection(ingredients: Ingredient[]) {
        this.selectedAdditionalIngredients = ingredients;
    }

    public onEventOrderCreation() {
        if (this.isEventOrderCreationInvalid()) {
            return;
        }

        this._socketService.socket.emit('order:create', {
            items: this._extractItems(this.selectedItems),
            eventId: this.selectedEvent?._id,
            clientName: this.eventOrderRegistryForm.controls.client.value as string,
        } as EventOrderCreatableParams);

        this.onBackStep();
    }

    public onOrderDetailView(order: EventOrder) {
        this._dialog.open(OrderDetailComponent, {
            data: order,
            height: '80vh',
        });
    }

    public onBackStep() {
        if (this.willCreateEventOrder) {
            if (this.isEventEditable()) {
                this.stepperRef.reset();

                this._resetInput();

                this.creationAnimationState = 'min';
            }

            return;
        }

        this._router.navigate(['/']);
    }

    public onCreationAnimation(event: AnimationEvent) {
        if (this.isEventEditable() === false) {
            return;
        }

        this._updateAvailableProducts();

        this.willCreateEventOrder = event.toState.trim().toLocaleLowerCase() === 'max';
    }

    public onOrderDeletion(order: EventOrder) {
        if (this.isEventEditable() === false || order.status !== OrderStatus.COOKING) {
            return;
        }

        const dialogRef = this._dialog.open(DialogComponent, {
            data: {
                message: this.languageSource['EVENT_ORDER_REGISTRY_DELETE_MESSAGE'],
            },
        });

        dialogRef.afterClosed().subscribe({
            next: (willDelete) => {
                if (willDelete === false) {
                    return;
                }

                this._socketService.socket.emit('order:delete', order._id);
            },
        });
    }

    public onOrderStep(order: EventOrder) {
        if (this.isEventEditable() === false || order.status === OrderStatus.PICKED_UP) {
            return;
        }

        this._socketService.socket.emit('order:edit', {
            id: order._id,
            values: {
                status:
                    order.status === OrderStatus.COOKING
                        ? OrderStatus.READY
                        : OrderStatus.PICKED_UP,
            } as EventOrderEditableParams,
        });
    }

    public onManualProductCount(target: EventTarget | null) {
        if (this.isEventEditable() === false || !target) {
            return;
        }

        const typedTarget = target as HTMLInputElement;

        const valueAsNumber = parseInt(typedTarget.value);

        if (isNaN(valueAsNumber) || valueAsNumber < this.MIN_PRODUCT_COUNT) {
            this.productCount = this.MIN_PRODUCT_COUNT;

            typedTarget.value = this.productCount.toString();

            return;
        }

        if (valueAsNumber > this.MAX_PRODUCT_COUNT) {
            this.productCount = this.MAX_PRODUCT_COUNT;

            typedTarget.value = this.productCount.toString();

            return;
        }

        this.productCount = valueAsNumber;
    }

    public onProductCountDecrement() {
        if (
            this.isEventEditable() === false ||
            this.productCount < this.MIN_PRODUCT_COUNT ||
            this.productCount > this.MAX_PRODUCT_COUNT
        ) {
            return;
        }

        this.productCount--;
    }

    public onProductCountIncrement() {
        this.productCount++;
    }

    public onProductConfirmation() {
        if (this.isEventEditable() === false || !this.selectedProduct) {
            return;
        }

        for (let i = 0; i < this.productCount; i++) {
            this.selectedItems.push({
                id: v4(),
                data: {
                    product: this.selectedProduct,
                    modifications: [
                        ...this.selectedOptionalIngredients,
                        ...this.selectedAdditionalIngredients,
                    ],
                },
            });
        }

        this.productCount = this.MIN_PRODUCT_COUNT;

        this.eventOrderRegistryForm.controls.items.reset();
    }

    public onProductSelection(nextSelectedProducts: Product[]) {
        if (this.isEventEditable() === false || !nextSelectedProducts) {
            this.selectedProduct = null;

            return;
        }

        this.selectedProduct = nextSelectedProducts[0];
    }

    public onItemDeletion(id: string) {
        this.selectedItems = this.selectedItems.filter((item) => item.id !== id);
    }

    private _extractItems(items: IdedOrderItem[]): OrderItemParam[] {
        const result: OrderItemParam[] = [];

        items.forEach((item) => {
            result.push({
                productId: item.data.product._id,
                modifications: item.data.modifications,
            });
        });

        return result;
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

    private _resetInput() {
        this.eventOrderRegistryForm.reset();

        this.selectedProduct = null;
        this.selectedItems = [];
        this.productCount = this.MIN_PRODUCT_COUNT;
    }

    private _removeOrder(target: EventOrder, orderList: EventOrder[]) {
        const foundTargetIndex = orderList.findIndex((order) => order._id === target._id);

        if (foundTargetIndex === -1) {
            return;
        }

        orderList.splice(foundTargetIndex, 1);
    }

    private _updateAvailableProducts() {
        this._apiService.V1.registry.product.search().subscribe({
            next: (response) => {
                if (response.wasSuccessful === false || !response.result) {
                    return;
                }

                this.availableProducts = response.result;
            },
        });
    }
}
