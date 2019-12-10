import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../login/auth.service';
import { API } from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import {createNotificationModel, NotificationModel} from './notification.model';
import {NotificationStore} from './notification.store';
import {tap} from 'rxjs/operators';
import {cacheable} from '@datorama/akita';



@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  componentName = 'Notification.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;

  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private authService: AuthService,
              private notificationStore: NotificationStore) {
  }

  update(notification) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(notification);

    const notificationUpdate = {};
    const keys = Object.keys(notification);

    for (let i = 0; i < keys.length; i++) {
      notificationUpdate[keys[i]] = notification[keys[i]];
    }

    console.log(notificationUpdate);

    this.notificationStore.update((e) => e.notificationId === notification.notificationId, notificationUpdate);
  }

  /**
   * Get notifications by user token, fetch all the notifications
   */
  getNotifications(): Observable<any> {
    const functionName = 'getNotifications';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          API.get(this.apiName, this.apiPath + '/getNotifications', myInit).then(response => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(response);
            observer.next(response.data.notifications);
            observer.complete();
          });
        });
    });
  }

  cacheNotifications() {
    const functionName = 'cacheNotifications';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getNotifications()
      .pipe(tap((notifications: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(notifications);

        const notificationsArray: NotificationModel[] = [];

        for (const notification of notifications) {

          const notificationId = notification.id;
          const title = notification.title;
          const description = notification.description;
          const event = notification.event;
          const audience = notification.audience;
          const createdAt = notification.createdAt;
          const updatedAt = notification.updatedAt;
          const timeSeen = notification.timeSeen;
          const targetUserId = notification.targetUserId;
          const sourceUserId = notification.sourceUserId;
          const departmentId = notification.departmentId;
          const securityRoleId = notification.securityRoleId;
          const status = notification.status;

          const notificationModel = createNotificationModel({notificationId: notificationId, title, description, audience,
            event, createdAt, updatedAt, timeSeen, targetUserId, sourceUserId, departmentId, securityRoleId, status});
          notificationsArray.push(notificationModel);

        }

        this.notificationStore.set(notificationsArray);
      }));

    return cacheable(this.notificationStore, request$);
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
          API.post(this.apiName, this.apiPath + '/setNotificationSeenTime', myInit).then(response => {
            console.log(`${functionFullName}: successfully set data from API`);
            console.log(response);

            if (response.data.status !== false) {
              const timeSeen = new Date(response.data.timeSeen);
              const notification = {
                notificationId: response.data.notificationId,
                timeSeen: timeSeen,
              };

              this.update(notification);

              observer.next(response.data);
              observer.complete();
            } else {

              observer.next(response.data);
              observer.complete();
            }
          });
        });
    });
  }

  sendNotification(notification): Observable<any> {
    const functionName = 'sendNotification';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: set new Notifications`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          let apiCall;

          myInit['body'] = {
            title: notification.title,
            event: notification.event,
            description: notification.description,
            status: notification.status,
          };

          switch (notification['audience']) {
            case 'department':
              apiCall = '/setNotificationsToDepartment';
              myInit['body']['departmentId'] = notification['departmentId'];
              break;
            case 'individual':
              apiCall = '/setNotificationsToPerson';
              myInit['body']['targetUserId'] = notification['targetUserId'];
              break;
          }

          myInit.headers['Authorization'] = token;
          // console.log(notification);

          API.post(this.apiName, this.apiPath + apiCall, myInit).then(data => {
            console.log(`${functionFullName}: successfully set data from API`);
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
    // console.log(`${functionFullName}: retrieving Alert data for the following point transaction ids:`);
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


}
