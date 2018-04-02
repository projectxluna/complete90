import { Component, OnInit } from '@angular/core';
import { AuthenticationService, DataService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  securityActive = false;
  notificationActive = false;
  paymentActive = false;
  me;

  constructor(private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) {
      dataService.getMe().subscribe(result => {
        if (result && result.success) {
          this.me = result;
        } else {
          //logout and show login page
        }
      });
    }
  
  getMe() {
    if (!this.me) {
      return;
      // logout and show login page
    }
    return this.me;
  }
  ngOnInit() {
  }

  toggleSecurity() {
    this.securityActive = !this.securityActive;
  }

  togglePayment() {
    this.paymentActive = !this.paymentActive;
  }

  toggleNotification() {
    this.notificationActive = !this.notificationActive;
  }
}
