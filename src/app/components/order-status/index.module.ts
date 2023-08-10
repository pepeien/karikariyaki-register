import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { OrderStatusComponent } from './index.component';

// Bundles
import { MaterialBundle } from '@imports';

@NgModule({
    declarations: [OrderStatusComponent],
    imports: [CommonModule, MaterialBundle],
    exports: [OrderStatusComponent],
})
export class OrderStatusModule {}
