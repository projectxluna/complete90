import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl, Validators, NgForm } from '@angular/forms';
declare var jQuery: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  constructor() { }

  ngOnInit() {
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


}
