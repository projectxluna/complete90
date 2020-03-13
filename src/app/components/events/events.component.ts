import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, RoutingState } from '../../services'
import { AuthenticationService } from '../../services';
import { FormControl, Validators, NgForm } from '@angular/forms';
declare var jQuery: any;

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

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
    jQuery(document).ready(function(){
      jQuery('.owl-carousel-summer').owlCarousel({
        responsiveClass:true,
        margin:10,
        responsive:{
            0:{
                items:3,
                nav:false
            },
            600:{
                items:3,
                nav:false
            },
            1000:{
                items:3,
                nav:false,
                loop:false
            }
        }
      });

      jQuery('.owl-carousel-testimoniels').owlCarousel({
        responsiveClass:true,
        margin:10,
        responsive: {
            0:{
                items:1,
                nav:false
            },
            600:{
                items:1,
                nav:false
            },
            1000:{
                items:2,
                nav:false,
                loop:false
            }
        }
      });

      var owl_stage;
      var current_img;
      jQuery(".owl-item img").on("click", function() {
          owl_stage = jQuery(this).closest( '.owl-stage' );
          current_img = jQuery(this).closest('.owl-item');
          jQuery('.zoomed').attr("src", jQuery(this).attr("src"));
          jQuery('#myModal').modal('show');
      });


      jQuery(".previous-slide").on("click", function() {
        current_img = current_img.prev(".owl-item").length != 0 ? current_img.prev(".owl-item") : current_img.closest(".owl-stage").find(".owl-item:last-child");;
        jQuery('.zoomed').attr("src", current_img.find("img").attr("src"));
      });


      jQuery(".next-slide").on("click", function() {
        current_img = current_img.next(".owl-item").length != 0 ? current_img.next(".owl-item") : current_img.closest(".owl-stage").find(".owl-item:first-child");
        jQuery('.zoomed').attr("src", current_img.find("img").attr("src")); 
      });


    });
  }


  mailchimpSubmit(f: NgForm){
    if(f.invalid) {
        jQuery(".sub-error-msg").slideDown();
        setTimeout(function() {jQuery(".sub-error-msg").slideUp();}, 5000);
        return;
    }
    let email = f.value.EMAIL;
    let fname = f.value.FNAME;
    let lname = f.value.LNAME;
    let phone = f.value.PHONE;

    jQuery.ajax({
        method: "GET",
        url: "https://thecomplete90.us12.list-manage.com/subscribe/post-json?u=18e4ef69694befc5389a215f1&amp;id=298bc9542e&c=?",
        dataType    : 'jsonp',
        jsonp: 'c',
        contentType: "application/json; charset=utf-8",
        data: { EMAIL: email, FNAME: fname, LNAME: lname, PHONE: phone }
    }).done(function( msg ) {
        jQuery(".sub-error-msg").slideUp();
        jQuery(".sub-succ-msg").slideDown();
        setTimeout(function() {jQuery(".sub-succ-msg").slideUp();}, 5000);
        f.reset();
    });
    //https://thecomplete90.us12.list-manage.com/subscribe/post?u=18e4ef69694befc5389a215f1&amp;id=298bc9542e

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


    isLoggedIn() {
        if (!this.authenticationService.token) {
        return false;
        } else {
        return true;
        }
  }
}