import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { AuthenticationService } from './authentication.service';

@Injectable()
export class DataService {

  constructor(
    private http: Http,
    private authenticationService: AuthenticationService) {
  }

  getApiHome(): Observable<Object> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get users from api
    return this.http.get('/api/', options)
      .map((response: Response) => response.json());
  }
}
