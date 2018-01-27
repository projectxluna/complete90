import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services'
import { AuthenticationService } from '../../services';
import { FormControl, Validators } from '@angular/forms';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
    model: any = {};
    loading = false;
    signup = false;
    hide = true;
    error = '';
    email = new FormControl('', [Validators.required, Validators.email]);

    constructor(
        private dataService: DataService, 
        private router: Router,
        private authenticationService: AuthenticationService) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
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
                    this.error = result.message
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
                    this.router.navigate(['/']);
                } else {
                    this.error = 'username or password is incorrect';
                    this.loading = false;
                }
            });
    }

    getErrorMessage() {
        return this.email.hasError('required') ? 'You must enter a value' :
            this.email.hasError('email') ? 'Not a valid email' :
                '';
    }
}
