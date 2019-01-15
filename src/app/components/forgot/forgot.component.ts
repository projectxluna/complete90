import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, RoutingState } from '../../services'
import { AuthenticationService } from '../../services';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  model: any = {};
  loading = false;
  resetEmailSent = false;
  showResetPassword = false;
  hide = true;
  error = '';
  token = null;
  email = new FormControl('', [Validators.required, Validators.email]);
  previousRoute: string;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private routingState: RoutingState) { }

  ngOnInit() {
    this.previousRoute = this.routingState.getPreviousUrl();

    let token = this.route.snapshot.queryParams["token"];
    if (token) {
      // console.log(token);
      this.token = token;
      this.showResetPassword = true;
    }
  }

  requestPasswordresetEmail() {
    if (!this.model.email) {
      this.error = 'please enter a valid email!';
      return;
    }
    this.loading = true;
    this.authenticationService.forgotPassword(this.model.email)
      .subscribe(result => {
        if (result && result.success == true) {
          //say something here 
          this.resetEmailSent = true;
        } else {
          this.error = result.message || 'Unkmown email address. Please try again';
          this.loading = false;
        }
      });
  }

  continueToPreviousRoute() {
    this.router.navigate([this.previousRoute]);
  }

  setNewPassword() {
    if (!this.model.newPassword && !this.model.verifyPassword) {
      this.error = 'please enter a new password!';
      return;
    }
    this.loading = true;
    this.authenticationService.resetPassword(this.model.newPassword, this.model.verifyPassword, this.token)
      .subscribe(result => {
        if (result && result.success == true) {
          //say something here 
          this.router.navigate(['/home']);
        } else {
          this.error = result.message;
          this.loading = false;
        }
      });
  }

  back() {
    this.router.navigate([this.previousRoute]);
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }
}
