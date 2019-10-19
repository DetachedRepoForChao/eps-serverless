import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../login/auth.service';
import { API } from 'aws-amplify';
import awsconfig from '../../../aws-exports';


export interface Notification {
  Name: string;
  Message: string;
}

@Injectable({
  providedIn: 'root'
})


export class NotificationService implements OnInit {
  componentName = 'Notification.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;

  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  ngOnInit(): void {

  }
  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient,
              private authService: AuthService) {

  }
  /**
   * Get notifications by user token, fetch all the notificaions
   * @param targetUserId
   */
  getNotification(): Observable<any> {
    const functionName = 'getNotifications';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: retrieving Notification data for the following point transaction ids:`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          API.get(this.apiName, this.apiPath + '/getNotifications', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }




  /**
   * Get the update status of notifications,which was not seen.
   * @param targetUserId
   */

  setNotificationSeenTime(notificationId: Number): Observable<any> {
    const functionName = 'setNotificationSeenTime';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: set Notification seen Time data for the following point transaction ids:`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            notificationId: notificationId,
          };
          API.post(this.apiName, this.apiPath + '/setNotificationSeenTime', myInit).then(data => {
            console.log(`${functionFullName}: successfully set data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

}
