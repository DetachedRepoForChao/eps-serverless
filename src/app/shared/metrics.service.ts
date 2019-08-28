import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {forkJoin, Observable} from 'rxjs';
import {GlobalVariableService} from './global-variable.service';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {DepartmentService} from './department.service';import {AvatarService} from './avatar/avatar.service';


export interface MetricsItem {
  Name: string;
  Time: any;
  User: any;
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  componentName = 'metrics.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  public metricsCache: MetricsItem[] = [];

  constructor(private authService: AuthService) { }

  uploadMetricsCache(): Observable<any> {
    const functionName = 'uploadMetricsCache';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = this.metricsCache;

          API.post(this.apiName, this.apiPath + '/uploadMetricsCache', myInit).then(data => {
            console.log(`${functionFullName}: successfully submitted metrics cache via API`);
            console.log(data);
            this.emptyMetricsCache();
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  uploadMetricsItem(metricsItem: MetricsItem): Observable<any> {
    const functionName = 'uploadMetricsItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = metricsItem;

          API.post(this.apiName, this.apiPath + '/uploadMetricsItem', myInit).then(data => {
            console.log(`${functionFullName}: successfully submitted metrics item via API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  addItemToMetricsCache(metricsItem: MetricsItem) {
    const functionName = 'addItemToMetricsCache';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Adding metrics item '${metricsItem.Name}' to metrics cache`);
    this.metricsCache.push(metricsItem);
  }

  emptyMetricsCache() {
    const functionName = 'emptyMetricsCache';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Purging ${this.metricsCache.length} items from metrics cache`);
    this.metricsCache = [];
  }
}
