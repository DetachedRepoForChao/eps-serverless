import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User } from '../user.model';
import {Department} from '../department.model';
import {Achievement} from './achievement.model';
import {mergeMap, map} from 'rxjs/operators';
import awsconfig from '../../../aws-exports';
import {Observable} from 'rxjs';
import {API} from 'aws-amplify';
import {AuthService} from '../../login/auth.service';
import {AchievementProgress} from './achievement-progress.model';

export interface AchievementItem {
  Name: string;
  Description: string;
  Cost: number;
  Progress: number;
  ProgressId: string;
  AchievementStatus: string;
  ProgressStatus: string;
  Family: string;
}


@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  componentName = 'achievement.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  achievements: Achievement[];
  achievementProgressList: AchievementProgress[];
  public achievementDataList: AchievementItem[];
  public achievementDataListFiltered: AchievementItem[];
  public completeAchievements: AchievementItem[];
  // noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient,
              private authService: AuthService) {

  }

  // HttpMethods
  getCurrentUserAchievements(): Observable<any> {
    const functionName = 'getCurrentUserAchievements';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/currentUserAchievements', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getAchievementById(achievementId: string): Observable<any> {
    const functionName = 'getAchievementById';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            achievementId: achievementId
          };

          API.post(this.apiName, this.apiPath + '/achievement', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getUserAchievements(): Observable<any> {
    const functionName = 'getUserAchievements';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.getCurrentUserAchievements()
        .subscribe((data: any) => {
          if (!data) {
            console.log(`${functionFullName}: No data returned`);
            observer.next({status: false, message: 'No data returned'});
            observer.complete();
          } else {
            console.log(`${functionFullName}: Data returned successfully`);
            this.achievementDataList = [];
            // const observables: Observable<any>[] = [];
            // Get the associated Achievement details
            console.log(data);
            for (let i = 0; i < data.length; i++) {
              console.log(`${functionFullName}: current user achievement item data:`);
              console.log(data[i]);
              // observables.push(this.achievementService.getAchievementById(currentAchievementProgressItem.achievement_id));

              const achievementItem: AchievementItem = {
                Name: data[i].achievementName,
                Description: data[i].achievementDescription,
                Cost: data[i].achievementCost,
                Progress: data[i].achievementProgressGoalProgress,
                ProgressId: data[i].achievementProgressId,
                AchievementStatus: data[i].achievementStatus,
                ProgressStatus: data[i].achievementProgressStatus,
                Family: data[i].achievementFamily
              };

              console.log(`${functionFullName}: current user achievement item:`);
              console.log(achievementItem);
              this.achievementDataList.push(achievementItem);
            }

            console.log(`${functionFullName}: achievementDataList:`);
            console.log(this.achievementDataList);

            const filteredList = this.filterAchievements(this.achievementDataList);
            // this.achievementDataListFiltered = this.achievementDataList.filter(x => ((x.ProgressStatus !== 'not started') && (x.ProgressStatus !== 'complete acknowledged'))).slice(0, 4);
            this.achievementDataListFiltered = filteredList.slice(0, 4);
            this.completeAchievements = this.achievementDataList.filter(x => ((x.ProgressStatus === 'complete') || (x.ProgressStatus === 'complete acknowledged')));

            console.log(`${functionFullName}: achievementDataListFiltered:`);
            console.log(this.achievementDataListFiltered);

            observer.next({status: true, message: 'Datasource updated successfully'});
            observer.complete();
          }
        });
    });
  }

  filterAchievements(achievementsList: AchievementItem[]): AchievementItem[] {
    const functionName = 'filterAchievements';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: filtering achievements list:`);
    console.log(achievementsList);

    const filteredList: AchievementItem[] = [];
    const completedList = achievementsList.filter(x => x.ProgressStatus === 'complete');
    console.log(`${functionFullName}: 'completed' achievements list:`);
    console.log(completedList);
    const inProgressList = achievementsList.filter(x => x.ProgressStatus === 'in progress');
    console.log(`${functionFullName}: 'in progress' achievements list:`);
    console.log(inProgressList);

    // Add the 'completed' achievements to the filtered achievements list
    for (let i = 0; i < completedList.length; i++) {
      console.log(`${functionFullName}: Adding 'completed' achievement ${completedList[i].Name} to the filtered list`);
      filteredList.push(completedList[i]);
    }

    // Add the 'in progress' achievements to the filtered achievements list
    for (let i = 0; i < inProgressList.length; i++) {
      // If there is a 'completed' achievement in the completed achievements list of the same family as this 'in progress'
      // achievement, do not add this achievement to the list
      const sameFamilyAchievementsList = completedList.filter(x => x.Family === inProgressList[i].Family);
      if (sameFamilyAchievementsList.length > 0) {
        // There is a 'completed' 'achievement of the same family as this 'in progress' achievement. The 'in progress' achievement
        // will not be added to the filtered list until the 'completed' achievement is acknowledged by the user.
        console.log(`${functionFullName}: There is a 'completed' achievement in the '${inProgressList[i].Family}' family. ` +
        `Not adding 'in progress' achievement '${inProgressList[i].Name}' to the filtered achievement list`);
      } else {
        console.log(`${functionFullName}: Adding 'in progress' achievement ${inProgressList[i].Name} to the filtered list`);
        filteredList.push(inProgressList[i]);
      }
    }

    return filteredList;
  }

  incrementAchievement(achievementName: string): Observable<any> {
    const functionName = 'incrementAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            achievementName: achievementName
          };

          API.post(this.apiName, this.apiPath + '/incrementAchievement' , myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  acknowledgeAchievementComplete(achievementProgressId: string) {
    const functionName = 'acknowledgeAchievementComplete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            achievementProgressId: achievementProgressId
          };

          API.post(this.apiName, this.apiPath + '/acknowledgeAchievementComplete' , myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  processUserAchievements() {
    const functionName = 'processUserAchievements';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.getCurrentUserAchievements()
      .subscribe(data => {
        console.log(`${functionFullName}: Achievement Progress data:`);
        console.log(data);
      });
  }

  getAchievementFamilyCount(achievement: AchievementItem): AchievementItem[] {
    return this.achievementDataList.filter(x => x.Family === achievement.Family);
  }
}
