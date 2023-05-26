import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Bundles
import { FormsBundle, MaterialBundle } from '@imports';

// Components
import { EventViewComponent } from './index.component';

// Modules
import { AutocompleteModule, AvatarModule, LogoModule } from '@components';

@NgModule({
	declarations: [EventViewComponent],
	imports: [
		AutocompleteModule,
		AvatarModule,
		CommonModule,
		FormsBundle,
		LogoModule,
		MaterialBundle,
	],
	exports: [EventViewComponent],
})
export class EventViewModule {}
