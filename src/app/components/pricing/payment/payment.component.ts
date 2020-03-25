import { Component, OnInit } from '@angular/core';
import * as dropin from 'braintree-web-drop-in';
import { DataService } from '../../../services';
import { AuthenticationService } from '../../../services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  error = '';
  plans = {};
  selectedPlan = {
    name: '',
    price: 0
  };

  static user = {name: undefined, address: undefined, postalcode: '', email: '', password: '', isManager: '', clubName: ''};

  static id;
  static dropinInstance;
  static canSubmitPayment = false;
  static _dataService;
  static _authenticationService;
  static _error;
  static _router;

  constructor(private dataService: DataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute) {
      PaymentComponent._dataService = dataService;
      PaymentComponent._router = router;
      PaymentComponent._authenticationService = authenticationService;

      // Get our braintree token and avaialable plans
      this.dataService.getClient().subscribe((res) => {
        if (res) {
          console.log(res.plans);
          this.processPlans(res.plans);

          // setup braintree dropin
          dropin.create({
            authorization: res.token,
            selector: '#dropin-container'
          }, function (err, dropinInstance) {
            if (err) {
              // Handle any errors that might've occurred when creating Drop-in
              PaymentComponent._router.navigate(['/pricing']);
              return;
            }
            PaymentComponent.canSubmitPayment = true;
            PaymentComponent.dropinInstance = dropinInstance;
          });
        }
      });
  }

  ngOnInit() {
    let planId = this.route.snapshot.queryParams["id"];
    PaymentComponent.user.name =  this.route.snapshot.queryParams["name"];
    PaymentComponent.user.address =  this.route.snapshot.queryParams["address"];
    PaymentComponent.user.postalcode =  this.route.snapshot.queryParams["postalcode"];
    PaymentComponent.user.email =  this.route.snapshot.queryParams["email"];
    PaymentComponent.user.password =  this.route.snapshot.queryParams["password"];
    PaymentComponent.user.isManager =  this.route.snapshot.queryParams["isManager"];
    PaymentComponent.user.clubName =  this.route.snapshot.queryParams["clubName"];

    if (!planId || planId === '') {
      this.router.navigate(['/pricing']);
      return;
    } 
    PaymentComponent.id = planId;
  }

  processPlans(plans) {
    plans.forEach(f => {
      this.plans[f.id] = f;
    });
    this.selectedPlan = this.plans[PaymentComponent.id];
  }


  login() {
    
  }

  addCard() {
    var user = PaymentComponent.user;
    console.log("User", PaymentComponent.user);
    if (PaymentComponent.canSubmitPayment && PaymentComponent.dropinInstance) {
      PaymentComponent.canSubmitPayment = !PaymentComponent.canSubmitPayment;
      PaymentComponent.dropinInstance.requestPaymentMethod(function (err, payload) {
        if (err) {
          // Handle errors in requesting payment method
          return;
        }
        // Send payload.nonce to your server
        PaymentComponent._dataService.beginSubscription(payload, PaymentComponent.id, user).subscribe((res) => {
          if (res && res.success) {
            //PaymentComponent._router.navigate(['/dashboard']);
            PaymentComponent._authenticationService.login(PaymentComponent.user.email, PaymentComponent.user.password)
            .subscribe(result => {
                if (result === true) {
                  PaymentComponent._dataService.getUserProfile().subscribe((me) => {
                    setTimeout(function(){
                      window.location.href = "/sessions";
                      //PaymentComponent._router.navigate(['/sessions']);
                    }, 1500);
                      
                    });
                } else {
                    this.error = 'username or password is incorrect';
                }
            });
          } else {
            // sorry we are unable to process your transaction right now
            PaymentComponent._error = 'sorry we are unable to process your transaction right now';
          }
        });
      });
    }
  } 
}
