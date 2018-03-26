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

  static id;
  static dropinInstance;
  static canSubmitPayment = false;
  static _dataService;
  static _error;
  static _router;

  constructor(private dataService: DataService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute) {
      PaymentComponent._dataService = dataService;
      PaymentComponent._router = router;

      // Get our braintree token and avaialable plans
      this.dataService.getClient().subscribe((res) => {
        if (res) {
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

  addCard() {
    if (PaymentComponent.canSubmitPayment && PaymentComponent.dropinInstance) {
      PaymentComponent.canSubmitPayment = !PaymentComponent.canSubmitPayment;
      PaymentComponent.dropinInstance.requestPaymentMethod(function (err, payload) {
        if (err) {
          // Handle errors in requesting payment method
          return;
        }
        // Send payload.nonce to your server
        PaymentComponent._dataService.beginSubscription(payload, PaymentComponent.id).subscribe((res) => {
          if (res && res.success) {
            PaymentComponent._router.navigate(['/dashboard']);
          } else {
            // sorry we are unable to process your transaction right now
            PaymentComponent._error = 'sorry we are unable to process your transaction right now';
          }
        });
      });
    }
  } 
}
