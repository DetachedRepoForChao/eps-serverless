import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../login/auth.service';
import { API } from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import { Notification } from 'src/app/shared/notifications/notification';


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
    // const functionName = 'getNotifications';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);
    // console.log(`${functionFullName}: retrieving Notification data for the following point transaction ids:`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          // const token = 'eyJraWQiOiI5NkIzYnMwblRMMnpKdHliUzg2REtJK1FEUHVkZ2FCeUM0bFwvSUQ0aFpYTT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzNzJjOTg2YS05MDNhLTQ0MzQtYjAyYi04ZDllMWYyMTllZjAiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImJpcnRoZGF0ZSI6IjAzXC8wN1wvMTk4NSIsImN1c3RvbTpkZXBhcnRtZW50IjoiRnJvbnQgRGVzayIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX3ZPZzRIU1pjOCIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6Imppbmh1IiwiY3VzdG9tOnNlY3VyaXR5X3JvbGUiOiJlbXBsb3llZSIsImdpdmVuX25hbWUiOiJKaW5odSIsInBpY3R1cmUiOiJwcm90ZWN0ZWRcL3VzLWVhc3QtMTo5OTNhZTYwMC1mNjFiLTQwMjEtYmZjNS1hNjRiYWQwZGU4MjFcL2F2YXRhcl9lb3hheGQ1emVvY2sxc2trb21uLnBuZyIsImN1c3RvbTpkZXBhcnRtZW50X2lkIjoiMiIsImF1ZCI6Ijd2Z2M1Z2Q3cTIwazFwNG04YXI5YmNxZDhtIiwiY3VzdG9tOnNlY3VyaXR5X3JvbGVfaWQiOiIxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NzI5NzI2MjMsIm5hbWUiOiJKaW5odSBXYW5nIiwicGhvbmVfbnVtYmVyIjoiKzE4NDg0NjY2Mjg5IiwiZXhwIjoxNTcyOTc2MjIzLCJpYXQiOjE1NzI5NzI2MjMsImZhbWlseV9uYW1lIjoiV2FuZyIsImVtYWlsIjoiamluaHV3YW5nMTEyN0BnbWFpbC5jb20ifQ.KLzSSAN0xiavROMlGdhepwiiMu7Y4U1iZNzLT8q7haz7a5TfOd15Ce4r5PPtn7hujfgjdV1pyYvlPaSXqhwMJUGz-kkufUEDE4JIuoNGenWkK0WqcP56HsrEvB5Kx60bWtpDk4SEDDsIxI_3fCSlatsLcDsPHs6OrzQCprAq7_ZUdJf8sAPN5Uyu7vCzGrWUeXO5L4qdoqxQscoivb48sIJkRvWs0J8bBFjQVVRwE7vwTGevmlCHce28BQXMt7Of5sGAv__DqxAX-Ox0rVmGoi4KZVFM7v2W7uJdTW2hlh2nXKQjdYRcZsNEdzYVZttfwxTLUvhKWnFUXD_m1JGw-A';
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          API.get(this.apiName, this.apiPath + '/getNotifications', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getAlert() : Observable<any> {
    const functionName = 'getAlert';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);
    // console.log(`${functionFullName}: retrieving Alert data for the following point transaction ids:`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          // const token = 'eyJraWQiOiI5NkIzYnMwblRMMnpKdHliUzg2REtJK1FEUHVkZ2FCeUM0bFwvSUQ0aFpYTT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzNzJjOTg2YS05MDNhLTQ0MzQtYjAyYi04ZDllMWYyMTllZjAiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImJpcnRoZGF0ZSI6IjAzXC8wN1wvMTk4NSIsImN1c3RvbTpkZXBhcnRtZW50IjoiRnJvbnQgRGVzayIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX3ZPZzRIU1pjOCIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6Imppbmh1IiwiY3VzdG9tOnNlY3VyaXR5X3JvbGUiOiJlbXBsb3llZSIsImdpdmVuX25hbWUiOiJKaW5odSIsInBpY3R1cmUiOiJwcm90ZWN0ZWRcL3VzLWVhc3QtMTo5OTNhZTYwMC1mNjFiLTQwMjEtYmZjNS1hNjRiYWQwZGU4MjFcL2F2YXRhcl9lb3hheGQ1emVvY2sxc2trb21uLnBuZyIsImN1c3RvbTpkZXBhcnRtZW50X2lkIjoiMiIsImF1ZCI6Ijd2Z2M1Z2Q3cTIwazFwNG04YXI5YmNxZDhtIiwiY3VzdG9tOnNlY3VyaXR5X3JvbGVfaWQiOiIxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NzI5NzI2MjMsIm5hbWUiOiJKaW5odSBXYW5nIiwicGhvbmVfbnVtYmVyIjoiKzE4NDg0NjY2Mjg5IiwiZXhwIjoxNTcyOTc2MjIzLCJpYXQiOjE1NzI5NzI2MjMsImZhbWlseV9uYW1lIjoiV2FuZyIsImVtYWlsIjoiamluaHV3YW5nMTEyN0BnbWFpbC5jb20ifQ.KLzSSAN0xiavROMlGdhepwiiMu7Y4U1iZNzLT8q7haz7a5TfOd15Ce4r5PPtn7hujfgjdV1pyYvlPaSXqhwMJUGz-kkufUEDE4JIuoNGenWkK0WqcP56HsrEvB5Kx60bWtpDk4SEDDsIxI_3fCSlatsLcDsPHs6OrzQCprAq7_ZUdJf8sAPN5Uyu7vCzGrWUeXO5L4qdoqxQscoivb48sIJkRvWs0J8bBFjQVVRwE7vwTGevmlCHce28BQXMt7Of5sGAv__DqxAX-Ox0rVmGoi4KZVFM7v2W7uJdTW2hlh2nXKQjdYRcZsNEdzYVZttfwxTLUvhKWnFUXD_m1JGw-A';
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          API.get(this.apiName, this.apiPath + '/getAlerts', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
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
    // console.log(`Start ${functionFullName}`);
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
            // console.log(`${functionFullName}: successfully set data from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }



  setNotificationToGroup(notificaion: Notification): Observable<any> {
    const functionName = 'setNewNotification';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);
    // console.log(`${functionFullName}: set new Notifications`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          // console.log(notificaion);
          myInit['body'] = {
            title: notificaion.Title,
            event: notificaion.event,
            description: notificaion.Description,
            groupid: notificaion.groupId,
            status: notificaion.status,
          };
          API.post(this.apiName, this.apiPath + '/setNotificationsToGroup', myInit).then(data => {
            // console.log(`${functionFullName}: successfully set data from API`);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  setNotificationToPerson(){

  }

}
