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
  componentName = 'point-item.service';
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
    const functionName = 'getPointItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getPointItems', myInit).then(data => {
      console.log(`${functionFullName}: data retrieved from API`);
      console.log(data);
      return data.data;
    });
  }


  async giftPointsToEmployee(sourceUserId: number, targetUserId: number, pointItemId: number, description: string) {
    const functionName = 'giftPointsToEmployee';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;
    myInit['body'] = {
      sourceUserId: sourceUserId,
      targetUserId: targetUserId,
      pointItemId: pointItemId,
      description: description
    };

    return API.post(this.apiName, this.apiPath + '/giftPointsToEmployee', myInit).then(data => {
      console.log(`${functionFullName}: data retrieved from API`);
      console.log(data);
      return data.data;
    });
  }

  async getRemainingPointPool() {
    const functionName = 'getRemainingPointPool';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getRemainingPointPool', myInit).then(data => {
      console.log(`${functionFullName}: data retrieved from API`);
      console.log(data);
      return data.data;
    });
  }

  storeRemainingPointPool() {
    const functionName = 'storeRemainingPointPool';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return this.getRemainingPointPool()
      .then(data => {
          console.log(data);
          localStorage.setItem('remainingPointPool', data);
          this.remainingPointPool = data;
          return true;
        }
      );
  }
}
