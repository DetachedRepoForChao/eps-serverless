import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../login/auth.service';
import { API } from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import {createNotificationModel, NotificationModel} from './entity-notification.model';
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

  constructor(private http: HttpClient,
              private authService: AuthService,
              private notificationStore: NotificationStore) {
    console.log('notification:' + this.apiName);

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


  cacheNotifications() {
    const functionName = 'cacheNotifications';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getNotification()
      .pipe(tap((notifications: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(notifications);

        const notificationItemsArray: NotificationModel[] = [];

        for (let i = 0; i < notifications.length; i++) {
          // We need to split the core values into an array of strings
          const coreValues: string[] = notifications[i].coreValues.split(';');
          for (let j = 0; j < coreValues.length; j++) {
            coreValues[j] = coreValues[j].trim();
          }
          const NotificationId = notifications[i].id;
          const title = notifications[i].title;
          const description = notifications[i].description;
          const event = notifications[i].event;
          const audience = notifications[i].audience;
          const createdAt = notifications[i].createdAt;
          const updatedAt = notifications[i].updatedAt;
          const timeSeen = notifications[i].timeSeen;
          const targetUserId = notifications[i].targetUserIdl;
          const notificationModel = createNotificationModel({NotificationId, title, description, audience,
            event, createdAt, updatedAt, timeSeen, targetUserId});
          notificationItemsArray.push(notificationModel);

        }

        this.notificationStore.set(notificationItemsArray);
      }));

    return cacheable(this.notificationStore, request$);
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
