import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Bundles
import { FormsBundle, MaterialBundle } from '@imports';

// Components
import { HomeViewComponent } from './index.component';

// Modules
import { AvatarModule, LogoModule } from '@components';

@NgModule({
    declarations: [HomeViewComponent],
    imports: [AvatarModule, CommonModule, FormsBundle, LogoModule, MaterialBundle],
    exports: [HomeViewComponent],
})
export class HomeViewModule {}
