import { Routes, RouterModule } from '@angular/router';
import { LoginSignupComponent } from './components/loginsignup';
import { ForgotComponent } from './components/forgot';
import { AuthGuard } from './guards';

//Static components
import { MainComponent } from './components/main';
import { AboutusComponent } from './components/aboutus';
import { TrainingComponent } from './components/training';
import { PricingComponent } from './components/pricing';
import { SessionsComponent } from './components/sessions';
import { PaymentComponent } from './components/pricing/payment';
import { DashboardComponent } from './components/dashboard';
import { EventsComponent } from './components/events';

const appRoutes: Routes = [
    { path: '', component: MainComponent },
    { path: 'login_signup', component: LoginSignupComponent },
    { path: 'forgot', component: ForgotComponent },
    { path: 'about', component: AboutusComponent },
    { path: 'training', component: TrainingComponent },
    { path: 'pricing', component: PricingComponent },
    { path: 'paynow', component: PaymentComponent, canActivate: [AuthGuard] },
    { path: 'sessions', component: SessionsComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
    { path: 'events', component: EventsComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
