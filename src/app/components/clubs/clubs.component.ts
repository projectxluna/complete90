import { Component, OnInit } from '@angular/core';
import { AuthenticationService, DataService } from '../../services';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
declare var require: any;

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  model: any = {};
  user: any;
  emailSent = false;
  error: string = '';
  club;
  allClubs;
  adminProfile: any;
  playerProfile: any;
  coachProfile: any;
  //this.model.from = "";

 constructor(
   private authenticationService: AuthenticationService,
    private router: Router,  private dataService: DataService) { 
  
  }

  ngOnInit() {
    this.getClubs();
    this.loadProfile();
    // if(!this.adminProfile) {
    //   this.router.navigate(['/']);
    // }
    //console.log("Admin: ", this.adminProfile);
  }

  loadProfile() {
    this.dataService.getUserProfile(false).subscribe(res => {
      this.user = res.user;
      this.onProfileUpdated(res.user);
      console.log("User: ", this.user);
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
        if( profile.type !== 'admin' ) {
          this.router.navigate(['/']);
        }
      });
    } else {
      // this.loadProfile();
    }
  }

  createClub() {
    console.log(this.model);
    if (!this.model.name || !this.model.email || !this.model.phone) {
            this.error = 'Make sure all required fields are completed!';
        return;
    }

    let payload = {
      userId: this.user.id,
      clubName: this.model.name,
      phone: this.model.phone,
      email: this.model.email,
    };


      this.authenticationService.createClub(payload)
        .subscribe(result => {
            if (result && result.success == true) {
                /**
                 * we should actually send them to a temp page
                 * that will ask them to confirm their email or 
                 * some other user validation step. then shortly
                 * after send them to the home page
                 */
                this.error = '';
                
                var obj = { 
                  _id: result.id,
                  name: this.model.name,
                  phoneNumber: this.model.phone,
                  email: this.model.email
                };
                console.log("All Clubs", this.allClubs);
                this.model = '';
                this.allClubs.push(obj);
            } else if (result && result.success !== true) {
                switch(result.code) {
                    case 11000:
                        this.error = 'Club name already exists. Please try something else';
                        break;
                    default:
                        this.error = result.message
                        break;
                }
            } else {
                this.error = 'Please try again. something went wrong';
            }
        });


  }

  getClubs() {
    this.dataService.getClubs().subscribe(result => {
      if (!result.success) {
        this.error = 'No clubs found!';
      } else {
        this.error = '';
        this.allClubs = Object.values(result['clubs']);
        console.log("Clubs", this.allClubs);
      }
    });
  }


    
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  clubSignup() {

    console.log(this.model.club);
    if (!this.validateEmail(this.model.club['email'])) {
      this.error = 'Please enter a valid email' + this.model.club['email'];
      return;
    }
    this.authenticationService.clubSignup(this.model).subscribe(result => {
      if (!result.success) {
        this.error = 'An error occured while sending your request. Please try again soon or contact us directly at support@thecomplete90.com';
      } else {
        this.error = '';
        this.emailSent = true;
      }
    });
  }




}
