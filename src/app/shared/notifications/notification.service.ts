import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../login/auth.service';
import { API } from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import { Notification } from 'src/app/shared/notifications/notification';


@Injectable({
  providedIn: 'root'
})


export class NotificationService implements OnInit {
  componentName = 'notification.service';

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

  constructor(private authService: AuthService) {

  }

  /**
   * Get notifications by user token, fetch all the notifications
   */
  getNotifications(): Observable<any> {
    const functionName = 'getNotifications';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    // console.log(`${functionFullName}: retrieving Notification data for the following point transaction ids:`);
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

  getAlerts(): Observable<any> {
    const functionName = 'getAlert';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: retrieving Alert data for the following point transaction ids:`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          API.get(this.apiName, this.apiPath + '/getAlerts', myInit).then(data => {
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
   * @param notificationId
   */

  setNotificationSeenTime(notificationId: number): Observable<any> {
    const functionName = 'setNotificationSeenTime';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    // console.log(`${functionFullName}: set Notification seen Time data for the following point transaction ids:`);
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



  setNotificationToGroup(notification: Notification): Observable<any> {
    const functionName = 'setNotificationToGroup';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: set new Notifications`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          console.log(notification);
          myInit['body'] = {
            title: notification.title,
            event: notification.event,
            description: notification.description,
            groupId: notification.groupId,
            status: notification.status,
          };
          API.post(this.apiName, this.apiPath + '/setNotificationsToGroup', myInit).then(data => {
            console.log(`${functionFullName}: successfully set data from API`);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  setNotificationToPerson(){

  }

}
