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


  downloadFile() {
    let link = document.createElement("a");
        link.download = "Complete90 Goal Setting Workbook.pdf";
        link.href = "../../assets/Complete90 Goal Setting Workbook.pdf";
        link.click();
  }

  validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  mailchimpSubmit(f: NgForm){
    if(f.invalid || !this.validateEmail(f.value.EMAIL)) {
        jQuery(".sub-error-msg").slideDown();
        setTimeout(function() {jQuery(".sub-error-msg").slideUp();}, 5000);
        return;
    }
    this.downloadFile();
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
