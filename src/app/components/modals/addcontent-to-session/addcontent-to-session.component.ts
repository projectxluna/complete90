import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-addcontent-to-session',
  templateUrl: './addcontent-to-session.component.html',
  styleUrls: ['./addcontent-to-session.component.less']
})
export class AddcontentToSessionComponent implements OnInit {

  page: number = 1;

  public onClose: Subject<any>;
  customSession;

  session = {
    name: '',
    reps: null,
    sets: null,
    minutes: null,
    seconds: null,
  }

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  response: any;

  createNewSession() {
    if (!this.session.name) return;

    this.response = {
      type: 'new',
      name: this.session.name,
      session: this.session
    };
    this.page = 2;
  }

  addToSession(id) {
    this.response = {
      type: 'add',
      id: id,
      session: this.session
    };
    this.page = 2;
  }
  
  setReps() {
    this.onClose.next(this.response);
    this.bsModalRef.hide();
  }
}
