import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services'
import { AuthenticationService } from '../../services';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  model: any = {};
  loading = false;
  signup = false;
  hide = true;
  error = '';
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(
    private dataService: DataService,
    private router: Router,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  requestPasswordresetEmail() {

  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }
}
