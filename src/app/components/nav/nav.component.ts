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
  me;
  avatarUrl = "/public/imgs/profile/default.jpg";

  constructor(
    private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) {
    // get the avatar url
    this.dataService.getMe().subscribe(result => {
      if (result && result.success == true) {
        this.me = result;
        this.avatarUrl = result.profile.avatarURL;
      }
    });
  }

  ngOnInit() { }

  isLoggedIn() {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  hasSubscription() {
    if (!this.me || !this.me.profile.subscription) {
      return false;
    }
    return true;
  }

  logout() {
    this.authenticationService.logout();
  }
}
