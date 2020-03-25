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

  bustCache() {
    this.cachedProfile = null;
    this.cachedSessions = null;
    this.cachedFreeSession = null;
  }

  findClubByName(clubName: string): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {clubName} });

    return this.http.get('/api/club', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  findPendingClubRequest(): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('/api/club/pending-request', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  addPlayerToClub(userId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/club/confirm-request', {userId}, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  createAssignment(payload): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/user/assignment', payload, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  getAssignments(planId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {planId} });

    return this.http.get('/api/user/assignment', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  getPlayerReport(playerId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {playerId} });

    return this.http.get('/api/report/assignment', options)
      .map((response: Response) => {
        return response.json();
      });
  }
  
  updateClub(club): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.put('/api/club', club, options)
      .map((response: Response) => {
        return  response.json();
      });
  }


  getClubs(): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/getClubs', {}, options)
      .map((response: Response) => {
        return response.json();
      });
  }


  createTeam(teamName): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/club/team', {teamName}, options)
      .map((response: Response) => {
        return response.json();
      });
  }




  updateTeam(team): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.put('/api/club/team', team, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  deleteTeam(teamId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {teamId} });

    return this.http.delete('/api/club/team', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  getTeams(): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('/api/club/teams', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  getPlayers(teamId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {teamId} });

    return this.http.get('/api/club/team/players', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  joinTeam(teamId, playerId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/club/join-team', {teamId, playerId}, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  removeFromTeam(playerId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {playerId} });

    return this.http
      .delete('/api/club/team/player', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  removeFromClub(playerId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {playerId} });

    return this.http
      .delete('/api/club/player', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  getUsersWithoutTeam(): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('/api/club/no-teams', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  requestClubAccess(clubId: string): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/club/join', {clubId}, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  getUserProfile(cache: boolean = true): Observable<any> {
    if (cache && this.cachedProfile) {
      return Observable.create((observer) => {
        observer.next(this.cachedProfile);
      });
    }

    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('/api/user/me', options)
      .map((response: Response) => {
        if (!response.json().success && localStorage.getItem('token')) {
          this.authenticationService.logout();
          this.cachedProfile = null;
          return;
        }
        this.cachedProfile = response.json();
        return this.cachedProfile;
      });
  }

  updateUserProfile(profile): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/user/me', profile, options)
      .map((response: Response) => {
        this.cachedProfile = response.json();
        return this.cachedProfile;
      });
  }

  activatePromoCode(code): Observable<any> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get users from api
    return this.http.post('/api/user/promo/activate', code, options)
      .map((response: Response) => {
        return response.json();
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
        if (!response.json().success) {
          return response.json();
        }
        this.cachedSessions = response.json();
        return this.cachedSessions;
      });
  }
  getLeaderBoard(timestamp, club): Observable<any> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, params: {timestamp, club}});

    return this.http.get('/api/session/leaderboard', options)
      .map((response: Response) => {
        return response.json();
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

  getPlayerAttributes(): Observable<any> {
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get sessions from api
    return this.http.get('/api//user/attributes', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  saveWatchedStats(payload): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/session/stats', payload, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  addContentToSession(sessions): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/session/content', sessions, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  editContentOfSession(sessionId, content): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .put('/api/session/content', {sessionId, content}, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  createSession(sessions): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/session', sessions, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  deleteContentFromSession(body): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, body });

    return this.http
      .delete('/api/session/content', options)
      .map((response: Response) => {
        return response.json();
      });
  }

  deleteSessions(sessionId): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers, body: { sessionId} });

    return this.http
      .delete('/api/session', options)
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

  uploadClubImage(fileToUpload: File, clubId): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('clubImg', fileToUpload, fileToUpload.name);
    formData.append('clubId', clubId);

    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('/api/club/club-img', formData, options)
      .map((response: Response) => {
        return response.json();
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

  beginSubscription(payload, planId, user): Observable<any> {
    let headers = new Headers({ 'x-access-token': this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });
    // get users from api
    return this.http.post('api/braintree/subsribe', { paymentPayload: payload, planId: planId, user: user }, options)
      .map((response: Response) => {
        if (response.json() && response.json().success) {
          return response.json();
        } else {
          return null;
        }
      });
  }
}
