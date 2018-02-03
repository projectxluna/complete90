import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { MaterialModule } from './modules/material.module';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { HomeComponent } from './components/home';

import { AuthGuard } from './guards';
import { DataService, AuthenticationService } from './services';
import { MainComponent } from './components/main/main.component';
import { ForgotComponent } from './components/forgot/forgot.component';
import { NavComponent } from './components/nav/nav.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MainComponent,
    ForgotComponent,
    NavComponent
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
    routing
  ],
  providers: [
    AuthGuard,
    DataService,
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class AppBootstrapModule {}
