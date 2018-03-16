import { Component, OnInit } from '@angular/core';
import * as dropin from 'braintree-web-drop-in';
import { DataService } from '../../../services';
import { AuthenticationService } from '../../../services';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  plans;
  selectedPlan;

  static dropinInstance;
  static canSubmitPayment = false;

  constructor(private dataService: DataService,
    private authenticationService: AuthenticationService) {
    // Get our braintree token and avaialable plans
    this.dataService.getClient().subscribe((res) => {
      if (res) {
        this.plans = res.plans;

        if (this.plans.length > 0) {
          this.selectedPlan = this.plans[0];
        }

        // setup braintree dropin
        dropin.create({
          authorization: res.token,
          selector: '#dropin-container'
        }, function (err, dropinInstance) {
          if (err) {
            // Handle any errors that might've occurred when creating Drop-in
            console.error(err);
            return;
          }
          PaymentComponent.canSubmitPayment = true;
          PaymentComponent.dropinInstance = dropinInstance;
        });
      }
    });
  }

  ngOnInit() {

  }

  submitPay() {
    if (PaymentComponent.canSubmitPayment && PaymentComponent.dropinInstance) {
      PaymentComponent.canSubmitPayment = !PaymentComponent.canSubmitPayment;
      PaymentComponent.dropinInstance.requestPaymentMethod(function (err, payload) {
        if (err) {
          // Handle errors in requesting payment method
          return;
        }
        
        // Send payload.nonce to your server
        PaymentComponent.canSubmitPayment = true;
      });
    }
  }

  setPlan(plan) {
    this.selectedPlan = plan;
  }

  getPlanString(selectedPlan) {
    if (!selectedPlan) {
      return "Plan";
    }
    return selectedPlan.name + " $" + selectedPlan.price;
  }
}
