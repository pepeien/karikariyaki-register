import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';

// Bundles
import { FormsBundle, MaterialBundle } from '@imports';

// Components
import { EventViewComponent } from './index.component';

// Modules
import { AvatarModule, LogoModule, TableModule } from '@components';

@NgModule({
	declarations: [EventViewComponent],
	imports: [
		AvatarModule,
		CommonModule,
		FormsBundle,
		LogoModule,
		MaterialBundle,
		MatStepperModule,
		TableModule,
	],
	exports: [EventViewComponent],
})
export class EventViewModule {}
