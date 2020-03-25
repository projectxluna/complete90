import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services'
import { AuthenticationService } from '../../services';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  avatarUrl = "/public/imgs/profile/default.jpg";
  userProfile = {
    subscription: undefined,
  };


  user = {
    name: '',
    subscription: undefined,
    nationality: '',
    creditCards: [],
    avatarURL: '',
    clubName: '',
  };
  playerProfile: any;
  coachProfile: any;
  adminProfile: any;


  collapsed = true;

  constructor(
    private router: Router,
    public dataService: DataService,
    public authenticationService: AuthenticationService) {
      this.init();
  }

  ngOnInit() {
  }

  init() {
    this.loadProfile();
    
    
  }

  hasSubscription(cb) {
    this.dataService.getUserProfile().subscribe(cb);
  }

  activeRequest = false;

  collapse() {
    this.collapsed = true;
  }

  expand() {
    this.collapsed = false;
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  isLoggedIn() {
    if (this.authenticationService.token) {
      if(!this.userProfile.subscription && !this.activeRequest) {
        this.activeRequest = true;
        this.hasSubscription((res) => {
          if (!res.success) {
            return;
          }
          this.avatarUrl = res.user.avatarURL;
          this.userProfile = res.user;
          this.activeRequest = false;
        });
      }
      return true;
    }
    return false;
  }

  logout() {
    this.authenticationService.logout();
    this.dataService.bustCache();
    this.collapse();
  }

  loadProfile() {
    this.dataService.getUserProfile(false).subscribe(res => {
      this.onProfileUpdated(res.user);
      console.log("User: ", this.user.subscription.planId);
    });
  }

  onProfileUpdated(user) {
    if (user) {
      this.user = user;
      this.user.avatarURL = user.avatarURL;
      this.playerProfile = user.profiles.find(profile => {
        return profile.type === 'PLAYER';
      });
      this.coachProfile = user.profiles.find(profile => {
        return profile.type === 'MANAGER';
      });
      this.adminProfile = user.profiles.find(profile => {
        return profile.type === 'admin';
      });
    } else {
      // this.loadProfile();
    }
  }


}
