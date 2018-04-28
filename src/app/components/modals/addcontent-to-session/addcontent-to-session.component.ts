import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-addcontent-to-session',
  templateUrl: './addcontent-to-session.component.html',
  styleUrls: ['./addcontent-to-session.component.css']
})
export class AddcontentToSessionComponent implements OnInit {

  public onClose: Subject<any>;
  customSession;

  session = {
    name: ''
  }

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  createNewSession() {
    this.onClose.next({
      type: 'new',
      name: this.session.name
    });
    this.bsModalRef.hide();
  }

  addToSession(id) {
    this.onClose.next({
      type: 'add',
      id: id
    });
    this.bsModalRef.hide();
  }
}
