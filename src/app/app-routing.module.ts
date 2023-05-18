import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Views
import { HomeViewComponent } from '@views';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: HomeViewComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
