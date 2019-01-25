import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {

  title;
  message;
  cancelLabel;
  confirmLabel;

  public onClose: Subject<any>;
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  back() {
    this.onClose.next({
      confirm: false
    });
    this.bsModalRef.hide();
  }

  continue() {
    this.onClose.next({
      confirm: true
    });
    this.bsModalRef.hide();
  }
}
