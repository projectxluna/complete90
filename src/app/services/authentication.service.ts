import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthenticationService {
  public token: string;

  constructor(
    private http: Http,
    private router: Router) {
    // set token if saved in local storage
    this.token = localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post('/api/login', { email: email, password: password })
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let token = response.json() && response.json().token;
        if (token) {
          // set token property
          this.token = token;

          // store jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', token);

          // return true to indicate successful login
          return true;
        } else {
          // return false to indicate failed login
          return false;
        }
      });
  }

  signup(profile): Observable<any> {
    return this.http.post('/api/signup', profile)
      .map((response: Response) => {
        return response.json();
      });
  }

  createClub(profile): Observable<any> {
    return this.http.post('/api/createClubs', profile)
      .map((response: Response) => {
        return response.json();
      });
  }

  


  clubSignup(payload): Observable<any> {
    return this.http.post('/api/clubSignup', payload)
      .map((response: Response) => {
        return response.json();
      });
  }


  getSignupPromo(payload): Observable<any> {
    return this.http.post('/api/getSignupPromo', payload)
      .map((response: Response) => {
        return response.json();
      });
  }


  contactus(payload): Observable<any> {
    return this.http.post('/api/contactus', payload)
      .map((response: Response) => {
        return response.json();
      });
  }

  logout(): void {
    // clear token from local storage to log user out
    this.token = null;
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post('/api/forgot_pasword', { email: email })
      .map((response: Response) => {
        return response.json();
      });
  }

  changePassword(oldPassword: string, newPassword: string, verifyPassword: string): Observable<any> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/update_password', { oldPassword: oldPassword, newPassword: newPassword, verifyPassword: verifyPassword }, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  resetPassword(newPassword: string, verifyPassword: string, token: string): Observable<any> {
    return this.http.post('/api/reset_password', { newPassword: newPassword, verifyPassword: verifyPassword, token: token })
      .map((response: Response) => {
        return response.json();
      });
  }
}
