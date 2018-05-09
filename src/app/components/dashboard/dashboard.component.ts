import { Component, OnInit, ViewChild } from '@angular/core';
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
    subscription: undefined,
    creditCards: []
  };
  stats = {
    watched: '',
    viewedTotal: 0
  }
  model: any = {};
  loading: boolean = false;

  editMode = false;
  
  @ViewChild('file') file;
  public files: Set<File> = new Set();

  constructor(private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) {
    dataService.getUserProfile().subscribe(user => {
      this.profile = user.profile;
    });
    dataService.getWatchedStats().subscribe(result => {
      if (result && result.success) {
        this.stats.watched = this.getHumanTime(result.watchedTotal);
        this.stats.viewedTotal = result.viewedTotal;
      }
    })
  }

  ngOnInit() {
  }

  getHumanTime(time) {
    let h = Math.floor(time / (60 * 60 * 1000));
    time = time % (60 * 60 * 1000);
    let m = Math.floor(time / (60 * 1000));
    time = time % (60 * 1000);
    let s = Math.floor(time / 1000);

    if (h) return h + ' Hours';
    if (m) return m + ' Minutes';
    if (s) return s + ' Seconds';
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

  onFilesAdded() {

  }

  addFiles() {
    this.file.nativeElement.click();
  }
}
