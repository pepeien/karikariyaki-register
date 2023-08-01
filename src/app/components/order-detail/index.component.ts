import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BasicAnimations } from '@animations';

// Service
import { ApiService, LanguageService } from '@services';
import { EventOrder, QrCodeRseponse } from 'karikarihelper';

@Component({
    selector: 'app-order-detail',
    templateUrl: 'index.component.html',
    animations: [BasicAnimations.breatheAnimation],
})
export class OrderDetailComponent implements OnInit {
    /**
     * Primitives
     */
    public qrCodeRedirector: QrCodeRseponse | undefined;

    /**
     * Animations
     */
    public logoBreatheAnimationState: 'inhale' | 'exhale' = 'inhale';

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

        this._apiService.V1.registry.eventOrder.getQRCode(this.order._id).subscribe({
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

    public onLogoBreatheAnimationDone() {
        if (this.qrCodeRedirector) {
            this.logoBreatheAnimationState = 'inhale';

            return;
        }

        this.logoBreatheAnimationState =
            this.logoBreatheAnimationState === 'inhale' ? 'exhale' : 'inhale';
    }
}
