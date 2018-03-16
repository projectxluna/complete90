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

  constructor(
    private router: Router,
    private dataService: DataService,
    private authenticationService: AuthenticationService) { }

  avatarUrl = "/public/imgs/profile/default.jpg";

  ngOnInit() {
    // get the avatar url
    this.dataService.getUserProfile().subscribe(result => {
      if (result && result.success == true) {
        this.avatarUrl = result.profile.avatarURL;
      } else {
        console.log('user does not have avatarUrl');
      }
    });
  }

  isLoggedIn() {
    if (localStorage.getItem('token')) {
      return true;
    }
    return false;
  }

  logout() {
    this.authenticationService.logout();
  }
}
