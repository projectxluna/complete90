import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main';
import { HomeComponent } from './components/home';
import { ForgotComponent } from './components/forgot';
import { AuthGuard } from './guards';

const appRoutes: Routes = [
    { path: '', component: MainComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent},
    { path: 'forgot', component: ForgotComponent},

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);