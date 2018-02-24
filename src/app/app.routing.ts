import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home';
import { ForgotComponent } from './components/forgot';
import { AuthGuard } from './guards';

//Static components
import { MainComponent } from './components/main';
import { AboutusComponent } from './components/aboutus';
import { TrainingComponent } from './components/training';
import { PricingComponent } from './components/pricing';
import { SessionsComponent } from './components/sessions';

const appRoutes: Routes = [
    { path: '', component: MainComponent},
    { path: 'home', component: HomeComponent},
    { path: 'forgot', component: ForgotComponent},
    { path: 'about', component: AboutusComponent},
    { path: 'training', component: TrainingComponent},
    { path: 'pricing', component: PricingComponent},
    { path: 'sessions', component: SessionsComponent},

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);