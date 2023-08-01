import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';

// Bundles
import { FormsBundle, MaterialBundle } from '@imports';

// Components
import { EventViewComponent } from './index.component';

// Modules
import {
    AutocompleteModule,
    AvatarModule,
    IngredientSelectorModule,
    LogoModule,
} from '@components';

@NgModule({
    declarations: [EventViewComponent],
    imports: [
        AutocompleteModule,
        AvatarModule,
        CommonModule,
        FormsBundle,
        IngredientSelectorModule,
        LogoModule,
        MaterialBundle,
        MatStepperModule,
    ],
    exports: [EventViewComponent],
})
export class EventViewModule {}
