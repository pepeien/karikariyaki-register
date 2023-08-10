import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Types
import { Interceptor } from '@types';

// Components
import { AppComponent } from './app.component';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './app-shared.module';
import { FloatAvatarModule, LoaderComponentModule, NavbarModule } from '@components';

// Services
import { ApiService } from '@services';

@NgModule({
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        FloatAvatarModule,
        LoaderComponentModule,
        NavbarModule,
        SharedModule,
    ],
    providers: [
        ApiService,
        RouterModule,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: Interceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
