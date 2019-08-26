import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';
import {API, Auth} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {Observable} from 'rxjs';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {Globals} from '../globals';

@Injectable({
  providedIn: 'root'
})
export class PointItemService {
  componentName = 'point-item.service';
  remainingPointPool;

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private http: HttpClient,
              private authService: AuthService,
              private globals: Globals) {

  }

  // HttpMethods

  getPointItems(): Observable<any> {
    const functionName = 'getPointItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointItems', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }


  giftPointsToEmployee(targetUserId: number, pointItemId: number, description: string): Observable<any> {
    const functionName = 'giftPointsToEmployee';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            targetUserId: targetUserId,
            pointItemId: pointItemId,
            description: description
          };

          console.log(`${functionFullName}: user ${this.globals.getUsername()} is awarding point item id ${pointItemId} to user id ${targetUserId}`);

          API.post(this.apiName, this.apiPath + '/giftPointsToEmployee', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getRemainingPointPool(): Observable<any> {
    const functionName = 'getRemainingPointPool';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getRemainingPointPool', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });

    });

  }

  storeRemainingPointPool(): Observable<any> {
    const functionName = 'storeRemainingPointPool';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.getRemainingPointPool()
        .subscribe(data => {
            console.log(data);
            localStorage.setItem('remainingPointPool', data);
            this.remainingPointPool = data;
            observer.next(true);
            observer.complete();
          }
        );
    });
  }
}
