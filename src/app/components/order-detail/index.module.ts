import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { OrderDetailComponent } from './index.component';

// Bundles
import { MaterialBundle } from '@imports';

@NgModule({
	declarations: [OrderDetailComponent],
	imports: [CommonModule, MaterialBundle],
	exports: [OrderDetailComponent],
})
export class OrderDetailModule {}
