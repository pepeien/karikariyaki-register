import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';

// Bundles
import { FormsBundle, MaterialBundle } from '@imports';

// Components
import { HomeViewComponent } from './index.component';

// Modules
import { AvatarModule, LogoModule, TableModule } from '@components';

@NgModule({
	declarations: [HomeViewComponent],
	imports: [
		AvatarModule,
		CommonModule,
		FormsBundle,
		LogoModule,
		MaterialBundle,
		MatStepperModule,
		TableModule,
	],
	exports: [HomeViewComponent],
})
export class HomeViewModule {}
