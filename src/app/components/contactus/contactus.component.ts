import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {
  model: any = {};
  error: string = '';
  emailSent = false;
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) { }

  ngOnInit() {
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  submit() {
    if (!this.model.name || !this.model.from || !this.model.message) {
      this.error = 'Please fill out all require fields.';
      return;
    }

    if (!this.validateEmail(this.model.from)) {
      this.error = 'Please enter a valid email';
      return;
    }
    this.authenticationService.contactus(this.model).subscribe(result => {
      if (!result.success) {
        this.error = 'An error occured while sending your request. Please try again soon or contact us directly at support@thecomplete90.com';
      } else {
        this.error = '';
        this.emailSent = true;
      }
    });
  }

  continue() {
    this.emailSent = false;
    this.router.navigate(['/home']);
  }
}
