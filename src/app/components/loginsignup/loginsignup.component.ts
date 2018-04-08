import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, RoutingState } from '../../services'
import { AuthenticationService } from '../../services';
import { FormControl, Validators } from '@angular/forms';

@Component({
    moduleId: module.id,
    templateUrl: 'loginsignup.component.html',
    styleUrls: ['loginsignup.component.css']
})
export class LoginSignupComponent implements OnInit {
    model: any = {};
    loading = false;
    signup = false;
    hide = true;
    error = '';
    email = new FormControl('', [Validators.required, Validators.email]);
    previousRoute: string;

    constructor(
        private dataService: DataService, 
        private router: Router,
        private authenticationService: AuthenticationService,
        private routingState: RoutingState) { }

    ngOnInit() {
        // reset login status
        //this.authenticationService.logout();
        this.previousRoute = this.routingState.getPreviousUrl();
    }

    toggleSignup() {
        this.signup = !this.signup;
    }

    signUp() {
        if (!this.model.firstname || !this.model.lastname || !this.model.email || !this.model.password) {
            this.error = 'make sure all required fields are completed!';
            return;
        }
        this.loading = true;

        let name = this.model.firstname + ' ' + this.model.lastname;
        this.authenticationService.signup(this.model.email, this.model.password, name)
            .subscribe(result => {
                console.log('signup response:', result);
                if (result && result.success == true) {
                    /**
                     * we should actually route them to a temp page
                     * that will ask them to confirm their email or 
                     * some other user validation step. then shortly
                     * after route them to the home page
                     */
                    this.signup = false;
                    this.loading = false;
                } else if (result && result.success !== true) {
                    switch(result.code) {
                        case 11000:
                            this.error = 'Your email is already in use. Please click forgot password or use a different email';
                            break;
                        default:
                            this.error = result.message
                            break;
                    }
                    this.loading = false;
                } else {
                    this.error = 'please try again. something went wrong';
                    this.loading = false;
                }
            });
    }

    login() {
        if (!this.model.email || !this.model.password) {
            this.error = 'make sure all required fields are completed!';
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.model.email, this.model.password)
            .subscribe(result => {
                if (result === true) {
                    this.dataService.getUserProfile().subscribe((me) => {
                        if (this.previousRoute !== '/') {
                            this.router.navigate([this.previousRoute]);
                        } else {
                            this.router.navigate(['/dashboard']);
                        }
                    });
                } else {
                    this.error = 'username or password is incorrect';
                    this.loading = false;
                }
            });
    }

    forgotPassword() {
        this.router.navigate(['/forgot']);
    }

    getErrorMessage() {
        return this.email.hasError('required') ? 'You must enter a value' :
            this.email.hasError('email') ? 'Not a valid email' :
                '';
    }
}
