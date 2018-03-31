import { Component, ViewChild, OnInit } from '@angular/core';
import { RoutingState } from './services';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  constructor(routingState: RoutingState, private router: Router) {
    routingState.loadRouting();
  }
}
