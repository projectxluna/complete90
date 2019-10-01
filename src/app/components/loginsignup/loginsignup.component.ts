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
    createManagerProfile = false;
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
        this.error = '';
        this.signup = !this.signup;
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    validateBillingInfo (address, postalcode) {
        // when  necessary incorporate google api, documentation at https://developers.google.com/maps/documentation/geocoding/start?utm_source=google&utm_medium=cpc&utm_campaign=FY18-Q2-global-demandgen-paidsearchonnetworkhouseads-cs-maps_contactsal_saf&utm_content=text-ad-none-none-DEV_c-CRE_315916118069-ADGP_Hybrid+%7C+AW+SEM+%7C+SKWS+~+Address+to+Coordinates-KWID_43700039136946312-kwd-371622337124-userloc_9000984&utm_term=KW_%2Baddress%20%2Bto%20%2Bcoordinates-ST_%2Baddress+%2Bto+%2Bcoordinates&gclid=EAIaIQobChMIt7nWv4XU5AIVtx-tBh34WwMaEAAYASAAEgLEAPD_BwE
        var pc = postalcode.replace(" ", "");
        pc = pc.toLowerCase();
        for (var i =0; i<pc.length; i++){   
            //  character with odd index
            if (i % 2 ==1 ){
                if (pc.charAt(i).match(/[a-z]/i)){
                    return false;
                }
            } else {
                if (!isNaN(pc.charAt(i))){
                    return false;
                }

            }
        }
        return true;
    }

    signUp() {
        if (!this.model.firstname || !this.model.lastname || 
            !this.model.email || !this.model.password || !this.model.address || !this.model.postalcode ) {
                this.error = 'Make sure all required fields are completed!';
            return;
        }
        if (!this.validateEmail(this.model.email)) {
            this.error = 'Please enter a valid email';
            return;
        }
        if (!this.validateBillingInfo(this.model.address, this.model.postalcode)){
            this.error = "Please enter a valid postal code and address!";
            return 
        }
        if (this.createManagerProfile && !this.model.clubName) {
            this.error = 'Club name is required to create a manager profile';
            return;
        }
        this.loading = true;

        let payload = {
            name: this.model.firstname + ' ' + this.model.lastname,
            address: this.model.address,
            postalcode: this.model.postalcode,
            email: this.model.email,
            password: this.model.password,
            isManager: this.createManagerProfile,
            clubName: this.model.clubName
        };
        this.authenticationService.signup(payload)
            .subscribe(result => {
                if (result && result.success == true) {
                    /**
                     * we should actually send them to a temp page
                     * that will ask them to confirm their email or 
                     * some other user validation step. then shortly
                     * after send them to the home page
                     */
                    this.signup = false;
                    this.loading = false;
                    this.error = '';
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
                    this.error = 'Please try again. something went wrong';
                    this.loading = false;
                }
            });
    }

    login() {
        if (!this.model.email || !this.model.password) {
            this.error = 'Make sure all required fields are completed!';
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.model.email, this.model.password)
            .subscribe(result => {
                if (result === true) {
                    this.dataService.getUserProfile().subscribe((me) => {
                        this.router.navigate(['/dashboard']);
                    });
                } else {
                    this.error = 'username or password is incorrect';
                    this.loading = false;
                }
            });
    }

    forgotPassword() {
        this.error = '';
        this.router.navigate(['/forgot']);
    }

    getErrorMessage() {
        return this.email.hasError('required') ? 'You must enter a value' : (this.email.hasError('email') ? 'Not a valid email' : '');
    }
}
