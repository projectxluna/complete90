import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { VideogularModule }from './modules/videogular/videogular.module';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { LoginSignupComponent } from './components/loginsignup';
import { CoachSignupComponent } from './components/coach-signup/coach_signup.component';


import { AuthGuard } from './guards';
import { DataService, AuthenticationService, RoutingState } from './services';
import { MainComponent } from './components/main/main.component';
import { ForgotComponent } from './components/forgot/forgot.component';
import { NavComponent } from './components/nav/nav.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import 'owl.carousel';

import { ProgramComponent } from './components/programs/program.component';

import { FooterComponent } from './components/footer/footer.component';

import { DragAndDropModule } from 'angular-draggable-droppable';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AboutusComponent } from './components/aboutus/aboutus.component';
import { SessionsComponent } from './components/sessions/sessions.component';
import { PricingComponent } from './components/pricing/pricing.component';

import { ClubsComponent } from './components/clubs/clubs.component';
import { ProAccountComponent } from './components/proAccount/proAccount.component';

import { TrainingComponent } from './components/training/training.component';
import { PaymentComponent } from './components/pricing/payment/payment.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EventsComponent } from './components/events/events.component';
import { VideoplayerComponent } from './components/modals/videoplayer/videoplayer.component';
import { AddcontentToSessionComponent } from './components/modals/addcontent-to-session/addcontent-to-session.component';
import { ContactusComponent } from './components/contactus/contactus.component';
import { TermsComponent } from './components/terms/terms.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ConfirmComponent } from './components/modals/confirm/confirm.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PlayerAttributesComponent } from './components/player-attributes/player-attributes.component';
import { LeaderBoardComponent } from './components/leader-board/leader-board.component';
import { MyClubComponent } from './components/my-club/my-club.component';
import { TeamRoasterComponent } from './components/team-roaster/team-roaster.component';
import { CreateAssignmentsComponent } from './components/create-assignments/create-assignments.component';
import { GetSubscriptionComponent } from './components/get-subscription/get-subscription.component';
import { GetAmateurSubscriptionComponent } from './components/get-amateur-subscription/get-amateur-subscription.component';
import { ElapsedTimestampPipe } from './pipes/elapsed-timestamp.pipe';
import { TimeSincePipe } from './pipes/time-since.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginSignupComponent,
    CoachSignupComponent,
    MainComponent,
    ForgotComponent,
    NavComponent,
    FooterComponent,
    AboutusComponent,
    SessionsComponent,
    PricingComponent,
    TrainingComponent,
    PaymentComponent,
    DashboardComponent,
    SettingsComponent,
    EventsComponent,
    VideoplayerComponent,
    ClubsComponent,
    ProAccountComponent,   
    AddcontentToSessionComponent,
    ContactusComponent,
    TermsComponent,
    PrivacyComponent,
    ConfirmComponent,
    ProfileComponent,
    PlayerAttributesComponent,
    LeaderBoardComponent,
    MyClubComponent,
    TeamRoasterComponent,
    CreateAssignmentsComponent,
    GetSubscriptionComponent,
    GetAmateurSubscriptionComponent,
    ElapsedTimestampPipe,
    TimeSincePipe,
    ProgramComponent
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    VideogularModule,
    HttpModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    routing,
    DragAndDropModule
  ],
  providers: [
    AuthGuard,
    DataService,
    AuthenticationService,
    RoutingState
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    VideoplayerComponent,
    AddcontentToSessionComponent,
    ConfirmComponent
  ]
})
export class AppModule { }
export class AppBootstrapModule {}
