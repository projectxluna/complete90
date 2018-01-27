import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main';
import { HomeComponent } from './components/home';
import { AuthGuard } from './guards';

const appRoutes: Routes = [
    { path: '', component: MainComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent},

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);