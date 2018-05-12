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
    creditCards: [],
    avatarURL: '',

    height: '',
    position: '',
    foot: ''
  };

  stats = {
    watched: '',
    viewedTotal: 0
  }
  model: any = {};
  loading: boolean = false;

  sessions = [];

  editMode = false;
  
  @ViewChild('file') file;

  constructor(private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) {
    dataService.getUserProfile(false).subscribe(user => {
      this.userProfileCallback(user.profile);
    });
    dataService.getWatchedStats().subscribe(result => {
      if (result && result.success) {
        this.stats.watched = this.getHumanTime(result.watchedTotal);
        this.stats.viewedTotal = result.viewedTotal;
      }
    });
    dataService.getSessions().subscribe((response) => {
      if (!response.success) return;
      this.sessions = [];

      this.groupContent(response.content);
    });
  }

  ngOnInit() {
  }

  groupContent(contentList) {
    let sessions = {};

    for (let content of contentList) {
      if (sessions[content.group]) {
        sessions[content.group].push(content);
      } else {
        sessions[content.group] = [content];
      }
    }
    for (var session in sessions) {
      if (!sessions.hasOwnProperty(session)) continue;

      var content = sessions[session];
      if (content.length > 0) {
        this.sessions.push(content[0]);
      }
    }
    if (this.sessions.length > 3) {
      this.sessions = this.sessions.slice(2);
    }
  }

  getHumanTime(time) {
    let h = Math.floor(time / (60 * 60 * 1000));
    time = time % (60 * 60 * 1000);
    let m = Math.floor(time / (60 * 1000));
    time = time % (60 * 1000);
    let s = Math.floor(time / 1000);

    if (h) return h + ' Hours';
    if (m) return m + ' Minutes';

    return s + ' Seconds';
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
    const files: { [key: string]: File } = this.file.nativeElement.files;

    if (files && files[0]) {
      this.dataService.uploadProfileImage(files[0]).subscribe(response => {
        if (response.success) {
          this.userProfileCallback(response.profile);
        }
      });
    }
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  updateProfile() {
    let foot = this.profile.foot;
    let position = this.profile.position;
    let height = this.profile.height;

    if (!foot || !position || !height) return;

    this.loading = true;
    let profile = {
      foot,
      position,
      height
    }
    this.dataService.updateUserProfile(profile).subscribe(response => {
      this.loading = false;
      this.editMode = false;
      if (response.success) {
        this.userProfileCallback(response.profile);
      }
    });
  }

  userProfileCallback(profile) {
    this.profile = profile;
  }
}
