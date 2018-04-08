import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services'
import { AuthenticationService } from '../../services';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  avatarUrl = "/public/imgs/profile/default.jpg";
  userProfile;

  constructor(
    private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) {
      dataService.getUserProfile().subscribe((user) => {
        this.avatarUrl = user.profile.avatarURL;
        this.userProfile = user.profile;
      });
  }

  ngOnInit() {
  }

  isLoggedIn() {
    if (this.authenticationService.token) {
      return true;
    }
    return false;
  }

  hasSubscription() {
    if (!this.userProfile || !this.userProfile.subscription) {
      return false;
    }
    return true;
  }

  logout() {
    this.authenticationService.logout();
  }
}
