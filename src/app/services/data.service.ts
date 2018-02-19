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

  getUserProfile(): Observable<Object> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get users from api
    return this.http.get('/api/user/me', options)
      .map((response: Response) => response.json());
  }

  uploadProfileImage(fileToUpload: File): Observable<boolean> {
    const formData: FormData = new FormData();
    formData.append('profileImg', fileToUpload, fileToUpload.name);

    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/user/profile-img', formData, options)
      .map((response: Response) => {
        if (response.json() && response.json().success) {
          return true;
        } else {
          return false;
        }
      });
  }
}
