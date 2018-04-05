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
  profile = {
    name: '',
    subscription: undefined
  };
  model: any = {};
  loading: boolean = false;

  constructor(private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) {
    dataService.getUserProfile().subscribe((user) => {
      this.profile = user.profile;
    });
  }

  ngOnInit() {
  }

  getSubscriptionLeft() {
    if (!this.profile.subscription) {
      return 0;
    }
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(this.profile.subscription.nextBillingDate);
    var secondDate = new Date();

    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
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

  updatePassword() {
    if (!this.model.oldPassword || !this.model.newPassword || !this.model.verifyPassword) {
      // 'make sure all required fields are completed!';
      console.log('make sure all required fields are completed!');
      return;
    }
    this.loading = true;

    this.authenticationService.changePassword(this.model.oldPassword, this.model.newPassword, this.model.verifyPassword)
      .subscribe(result => {
        if (result && result.success == true) {
          this.loading = false;
        } else {
          //'please try again. something went wrong';
          this.loading = false;
        }
      });
  }
}
