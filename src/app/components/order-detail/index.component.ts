import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Service
import { ApiService, LanguageService } from '@services';
import { EventOrder, QrCodeRseponse } from 'karikarihelper';

@Component({
	selector: 'app-order-detail',
	templateUrl: 'index.component.html',
})
export class OrderDetailComponent implements OnInit {
	/**
	 * Primitives
	 */
	public qrCodeRedirector: QrCodeRseponse | undefined;

	/**
	 * Props
	 */
	public order: EventOrder | undefined;

	/**
	 * Language
	 */
	public languageSource = LanguageService.DEFAULT_LANGUAGE;

	constructor(
		public dialogRef: MatDialogRef<OrderDetailComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: EventOrder,
		private _apiService: ApiService,
		private _languageService: LanguageService,
	) {
		if (data) {
			this.order = data;
		}
	}

	ngOnInit(): void {
		if (!this.order) {
			return;
		}

		this._apiService.V1.eventOrderRegistry.getQRCode(this.order._id).subscribe({
			next: (response) => {
				if (response.wasSuccessful === false || !response.result) {
					return;
				}

				this.qrCodeRedirector = response.result;
			},
		});

		this._languageService.language.subscribe({
			next: (nextLanguage) => {
				this.languageSource = nextLanguage;
			},
		});
	}
}
