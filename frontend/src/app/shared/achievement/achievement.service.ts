import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User } from '../user.model';
import {Department} from '../department.model';
import {Achievement} from './achievement.model';
import {mergeMap, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {

  achievements: Achievement[];

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  // HttpMethods
  getUserAchievementProgressByUserId(userId: string) {
    console.log('getUserAchievementProgressByUserId');
    return this.http.post(environment.apiBaseUrl + '/userAchievementProgressByUserId', {userId: userId});
  }

  getAchievementById(achievementId: string) {
    console.log('getAchievementById');
    return this.http.post(environment.apiBaseUrl + '/achievement', {achievementId: achievementId});
  }

  // Named Achievement Methods
  incrementAchievementSignIn(userId: number) {
    console.log('incrementAchievementSignIn userId: ' + userId);

    return this.http.post(environment.apiBaseUrl + '/incrementAchievementSignIn', {userId: userId}, this.noAuthHeader);
  }

  incrementAchievementGiftFirstPointItem(userId: number) {
    console.log('incrementAchievementGiftFirstPointItem userId: ' + userId);

    return this.http.post(environment.apiBaseUrl + '/incrementAchievementGiftFirstPointItem', {userId: userId}, this.noAuthHeader);
  }

  incrementAchievementReceiveFirstPointItem(userId: number) {
    console.log('incrementAchievementReceiveFirstPointItem userId: ' + userId);

    return this.http.post(environment.apiBaseUrl + '/incrementAchievementReceiveFirstPointItem', {userId: userId}, this.noAuthHeader);
  }

  incrementAchievement(achievementName: string, userId: number) {
    console.log('incrementAchievement ' + achievementName);
    return this.http.post(environment.apiBaseUrl + '/incrementAchievement/' + achievementName, {userId: userId});
  }

}
