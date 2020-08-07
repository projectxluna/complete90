import { Component, EventEmitter, Output, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'amateur',
  templateUrl: './get-amateur-subscription.component.html',
  styleUrls: ['./get-amateur-subscription.component.less']
})
export class GetAmateurSubscriptionComponent implements OnInit {

  @Output() subscriptionUpdated = new EventEmitter<any>();
  promoCodeError: string = '';
  loading: boolean;
  model = {
    promoCode: ''
  };

  modalRef: BsModalRef;
  constructor(
    private dataService: DataService,
    private modalService: BsModalService) {}

  ngOnInit() {
  }

  claimCode() {
    if (this.loading) {
      return;
    }
    if (!this.model.promoCode) {
      this.promoCodeError = 'Invalid Code';
      return;
    }

    this.loading = true;
    this.promoCodeError = '';

    this.dataService.activatePromoCode({ code: this.model.promoCode }).subscribe((response) => {
      this.loading = false;
      if (response && response.success) {
        this.promoCodeError = 'Promo code activated!!';
        setTimeout(() => {
          this.modalRef.hide();
          window.location.reload();
        }, 2000);
        this.subscriptionUpdated.emit();
      } else {
        console.log(this.modalRef)
        this.promoCodeError = 'Unable to activate code. Please try again!';
      }
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
    window.location.reload();
  }
}
