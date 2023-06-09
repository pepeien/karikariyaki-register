import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { OrderDetailComponent } from './index.component';

// Bundles
import { MaterialBundle } from '@imports';

// Modules
import { OrderStatusModule } from '../order-status';
import { LogoModule } from '../logo';

@NgModule({
	declarations: [OrderDetailComponent],
	imports: [CommonModule, LogoModule, MaterialBundle, OrderStatusModule],
	exports: [OrderDetailComponent],
})
export class OrderDetailModule {}
