import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { AuthenticationService } from './authentication.service';

@Injectable()
export class DataService {
  cachedProfile;
  cachedSessions;
  cachedFreeSession;

  constructor(
    private http: Http,
    private authenticationService: AuthenticationService) {
  }

  getUserProfile(cache: boolean = true): Observable<any> {
    if (cache && this.cachedProfile) {
      return Observable.create((observer) => {
        observer.next(this.cachedProfile);
      });
    }

    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get users from api
    return this.http.get('/api/user/me', options)
      .map((response: Response) => {
        this.cachedProfile = response.json();
        return this.cachedProfile;
      });
  }

  updateUserProfile(profile): Observable<any> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get users from api
    return this.http.post('/api/user/me', profile, options)
      .map((response: Response) => {
        this.cachedProfile = response.json();
        return this.cachedProfile;
      });
  }

  getFreeSessions(cache: boolean = true): Observable<any> {
    if (cache && this.cachedFreeSession) {
      return Observable.create((observer) => {
        observer.next(this.cachedFreeSession);
      });
    }

    // get sessions from api
    return this.http.get('/api/free-sessions')
      .map((response: Response) => {
        this.cachedFreeSession = response.json();
        return this.cachedFreeSession;
      });
  }

  getSessions(cache: boolean = true): Observable<any> {
    if (cache && this.cachedSessions) {
      return Observable.create((observer) => {
        observer.next(this.cachedSessions);
      });
    }
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get sessions from api
    return this.http.get('/api/sessions', options)
      .map((response: Response) => {
        this.cachedSessions = response.json();
        return this.cachedSessions;
      });
  }

  getWatchedStats(): Observable<any> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get sessions from api
    return this.http.get('/api/session/stats', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  saveWatchedStats(contentStats): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/session/stats', { contentStats: contentStats }, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  saveSessions(sessions): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/session/plan', sessions, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  deleteSessions(sessionId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, body: { sessionId} });

    return this.http
      .delete('/api/session/plan', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  uploadProfileImage(fileToUpload: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('profileImg', fileToUpload, fileToUpload.name);

    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/user/profile-img', formData, options)
      .map((response: Response) => {
        this.cachedProfile = response.json();
        return this.cachedProfile;
      });
  }

  getClient(): Observable<any> {
    // get users from api
    return this.http.get('api/braintree/subsribe')
      .map((response: Response) => {
        if (response.json() && response.json().success) {
          return response.json();
        } else {
          return null;
        }
      });
  }

  beginSubscription(payload, planId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });
    // get users from api
    return this.http.post('api/braintree/subsribe', { paymentPayload: payload, planId: planId }, options)
      .map((response: Response) => {
        if (response.json() && response.json().success) {
          return response.json();
        } else {
          return null;
        }
      });
  }
}
