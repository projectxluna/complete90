import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
  public token: string;

  constructor(private http: Http) {
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

  signup(email: string, password: string, name: string): Observable<any> {
    return this.http.post('/api/signup', { email: email, password: password, name: name })
      .map((response: Response) => {
        return response.json();
      });
  }

  logout(): void {
    // clear token from local storage to log user out
    this.token = null;
    localStorage.removeItem('token');
  }
}
