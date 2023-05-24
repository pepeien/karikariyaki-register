import { Component, OnInit } from '@angular/core';
import { Operator } from 'karikarihelper';

// Service
import { LoadingService, OperatorService } from '@services';

// Animations
import { AutomaticAnimation, BasicAnimations, LoggedNavbarAnimation } from '@animations';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	animations: [BasicAnimations.breatheAnimation, AutomaticAnimation.slideInOut],
})
export class AppComponent implements OnInit {
	/**
	 * Primitivers
	 */
	public isLoggedIn = false;

	/**
	 * In House
	 */
	public operator: Operator | null = null;

	constructor(private _operatorService: OperatorService) {}

	ngOnInit(): void {
		this._operatorService.operator.subscribe({
			next: (currentOperator) => {
				if (!currentOperator) {
					this.isLoggedIn = false;

					return;
				}

				setTimeout(() => {
					this.isLoggedIn = true;
					this.operator = currentOperator;
				}, LoggedNavbarAnimation.LOGGED_SWIPE_ANIMATION_DURATION_IS_MS);
			},
			error: () => {
				this.isLoggedIn = false;
			},
		});
	}
}
