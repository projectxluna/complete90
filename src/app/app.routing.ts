import { Routes, RouterModule } from '@angular/router';
import { LoginSignupComponent } from './components/loginsignup';
import { CoachSignupComponent } from './components/coach-signup';
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
import { ContactusComponent } from './components/contactus';
import { TermsComponent } from './components/terms';
import { PrivacyComponent } from './components/privacy';
import { ClubsComponent } from './components/clubs';
import { ProAccountComponent } from './components/proAccount';
import { ProgramComponent } from './components/programs';


const appRoutes: Routes = [
    { path: '', component: MainComponent },
    { path: 'login_signup', component: LoginSignupComponent },
    { path: 'coach_signup', component: CoachSignupComponent },
    { path: 'forgot', component: ForgotComponent },
    { path: 'about', component: AboutusComponent },
    { path: 'training', component: TrainingComponent },
    { path: 'pricing', component: PricingComponent },
    { path: 'paynow', component: PaymentComponent},
    { path: 'sessions', component: SessionsComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
    { path: 'events', component: EventsComponent },
    { path: 'contact', component: ContactusComponent },
    { path: 'terms', component: TermsComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'clubs', component: ClubsComponent },
    { path: 'proAccount', component: ProAccountComponent },
    { path: 'programs', component: ProgramComponent },
    

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
