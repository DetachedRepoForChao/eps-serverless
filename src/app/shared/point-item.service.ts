import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';

@Injectable({
  providedIn: 'root'
})
export class PointItemService {

  remainingPointPool;
  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  // HttpMethods

  getPointItems() {
    console.log('getPointItems');
    return this.http.get(environment.apiBaseUrl + '/getPointItems');
  }

/*
  addPointsToEmployee(sourceUserId: number, targetUserId: number, pointItemId: number, amount: number, description: string) {
      console.log('addPointsToEmployee');
    return this.http.post(environment.apiBaseUrl + '/addPointsToEmployee',
      {sourceUserId: sourceUserId, targetUserId: targetUserId, pointItemId: pointItemId, amount: amount, description: description});
  }
*/

  giftPointsToEmployee(sourceUserId: number, targetUserId: number, pointItemId: number, description: string) {
    console.log('giftPointsToEmployee');
    return this.http.post(environment.apiBaseUrl + '/giftPointsToEmployee',
      {sourceUserId: sourceUserId, targetUserId: targetUserId, pointItemId: pointItemId, description: description});
  }

  getRemainingPointPool(managerId: number) {
    console.log('getRemainingPointPool');
    return this.http.post(environment.apiBaseUrl + '/getRemainingPointPool', {managerId: managerId});
  }

  storeRemainingPointPool() {
    console.log('storeRemainingPointPool');
    return this.getRemainingPointPool(+localStorage.getItem('userId'))
      .subscribe(data => {
          console.log(data);
          localStorage.setItem('remainingPointPool', data['pointsRemaining']);
          this.remainingPointPool = data['pointsRemaining'];
          return true;
        }
      );
  }
}
