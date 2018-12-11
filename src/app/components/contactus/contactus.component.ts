import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {
  model: any = {};
  error: string = '';
  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  submit() {
    if (!this.model.name || !this.model.from || !this.model.message) {
      this.error = 'Please fill out all require fields.';
      return;
    }
    this.authenticationService.contactus(this.model).subscribe(result => {
      if (!result.success) {
        this.error = 'An error occured while sending your request. Please try again soon or contact us directly at info@thecomplete90.com';
      } else {
        this.error = '';
      }
    });
  }
}
