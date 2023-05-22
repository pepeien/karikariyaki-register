import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Operator } from 'karikarihelper';

// Service
import { OperatorService } from '@services';

// Animations
import { LoggedNavbarAnimation } from './animations/navbar';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
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
