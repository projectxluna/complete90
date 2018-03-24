import { Component, ViewChild } from '@angular/core';
import { RoutingState } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(routingState: RoutingState) {
    routingState.loadRouting();
  }
}
