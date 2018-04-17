import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { MaterialModule } from './modules/material.module';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { LoginSignupComponent } from './components/loginsignup';

import { AuthGuard } from './guards';
import { DataService, AuthenticationService, RoutingState } from './services';
import { MainComponent } from './components/main/main.component';
import { ForgotComponent } from './components/forgot/forgot.component';
import { NavComponent } from './components/nav/nav.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FooterComponent } from './components/footer/footer.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AboutusComponent } from './components/aboutus/aboutus.component';
import { SessionsComponent } from './components/sessions/sessions.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { TrainingComponent } from './components/training/training.component';
import { PaymentComponent } from './components/pricing/payment/payment.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EventsComponent } from './components/events/events.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginSignupComponent,
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
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    MaterialModule,
    FlexLayoutModule,
    HttpModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    routing
  ],
  providers: [
    AuthGuard,
    DataService,
    AuthenticationService,
    RoutingState
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class AppBootstrapModule {}
