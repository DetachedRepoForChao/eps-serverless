import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';
import {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PointItemService {

  remainingPointPool;

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  constructor(private http: HttpClient, private authService: AuthService) {

  }

  // HttpMethods

  async getPointItems() {
    console.log('getPointItems');

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getPointItems', this.myInit).then(data => {
      console.log('serverless getPointItems');
      console.log(data);
      return data.data;
    });

    // return this.http.get(environment.apiBaseUrl + '/getPointItems');
  }

/*
  addPointsToEmployee(sourceUserId: number, targetUserId: number, pointItemId: number, amount: number, description: string) {
      console.log('addPointsToEmployee');
    return this.http.post(environment.apiBaseUrl + '/addPointsToEmployee',
      {sourceUserId: sourceUserId, targetUserId: targetUserId, pointItemId: pointItemId, amount: amount, description: description});
  }
*/

  async giftPointsToEmployee(sourceUserId: number, targetUserId: number, pointItemId: number, description: string) {
    console.log('giftPointsToEmployee');

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;
    this.myInit['body'] = {
      sourceUserId: sourceUserId,
      targetUserId: targetUserId,
      pointItemId: pointItemId,
      description: description
    };

    return API.post(this.apiName, this.apiPath + '/giftPointsToEmployee', this.myInit).then(data => {
      console.log('serverless giftPointsToEmployee');
      console.log(data);
      return data.data;
    });

    // return this.http.post(environment.apiBaseUrl + '/giftPointsToEmployee',
    //   {sourceUserId: sourceUserId, targetUserId: targetUserId, pointItemId: pointItemId, description: description});
  }

  async getRemainingPointPool() {
    console.log('getRemainingPointPool');

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getRemainingPointPool', this.myInit).then(data => {
      console.log('serverless getRemainingPointPool');
      console.log(data);
      return data.data;
    });

    // return this.http.post(environment.apiBaseUrl + '/getRemainingPointPool', {managerId: managerId});
  }

  storeRemainingPointPool() {
    console.log('storeRemainingPointPool');
    return this.getRemainingPointPool()
      .then(data => {
          console.log(data);
          localStorage.setItem('remainingPointPool', data['pointsRemaining']);
          this.remainingPointPool = data['pointsRemaining'];
          return true;
        }
      );
  }
}
