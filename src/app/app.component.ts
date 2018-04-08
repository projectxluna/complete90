import { Component, ViewChild, OnInit } from '@angular/core';
import { RoutingState, DataService } from './services';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService]
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

  constructor(routingState: RoutingState, private router: Router, public dataService: DataService) {
      routingState.loadRouting();
  }
}
