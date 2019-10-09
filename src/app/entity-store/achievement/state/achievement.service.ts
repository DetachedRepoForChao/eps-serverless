import { AchievementStore } from './achievement.store';
import { AchievementQuery} from './achievement.query';
import { createEntityAchievementModel, AchievementModel } from './achievement.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/achievement-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {AchievementItem} from '../../../shared/achievement/achievement.service';

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

  constructor(private achievementStore: AchievementStore,
              private achievementQuery: AchievementQuery,
              private globals: Globals,
              private authService: AuthService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.achievementStore.update({
      ui: {
        filter
      }
    });
  }



  add(achievementId: number, name: string, description: string, cost: number, progress: number, progressId: string,
      achievementStatus: string, progressStatus: string, family: string, startAmount: number, level: number) {

    const achievement = createEntityAchievementModel({ achievementId, name, description, cost, progress, progressId,
      achievementStatus, progressStatus, family, startAmount, level });
    this.achievementStore.add(achievement);
  }


  delete(id: ID) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: ${id}`);
    this.achievementStore.remove(id);
  }

  reset() {
    this.achievementStore.reset();
  }

  updateAchievementStatus(achievementProgressId: string, status: string) {
    this.achievementStore.update((e) => e.progressId === achievementProgressId, {
      progressStatus: status,
    });
  }

  updateAchievements(achievementsData: any) {
    console.log('updateAchievements:');
    console.log(achievementsData);
    for (let i = 0; i < achievementsData.length; i++) {
      this.achievementStore.update((e) => e.progressId === achievementsData[i].id, {
        progress: achievementsData[i].goalProgress,
        progressStatus: achievementsData[i].status,
      });
    }
  }

  cacheAchievements() {
    const functionName = 'cacheAchievements';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    // this.userStore.setLoading(true);  // this is the initial state before doing anything
    const request$ = this.getCurrentUserAchievements()
      .pipe(tap((achievementsResult: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(achievementsResult);

        const achievements: AchievementModel[] = [];
        for (let i = 0; i < achievementsResult.length; i++) {
          // const achievementId = achievementsResult[i].achievementId;
          const achievementId = achievementsResult[i].achievement.id;
          // const name = achievementsResult[i].achievementName;
          const name = achievementsResult[i].achievement.name;
          // const description = achievementsResult[i].achievementDescription;
          const description = achievementsResult[i].achievement.description;
          // const cost = achievementsResult[i].achievementCost;
          const cost = achievementsResult[i].achievement.cost;
          // const progress = achievementsResult[i].achievementProgressGoalProgress;
          const progress = achievementsResult[i].goalProgress;
          // const progressId = achievementsResult[i].achievementProgressId;
          const progressId = achievementsResult[i].id;
          // const achievementStatus = achievementsResult[i].achievementStatus;
          const achievementStatus = achievementsResult[i].achievement.status;
          // const progressStatus = achievementsResult[i].achievementProgressStatus;
          const progressStatus = achievementsResult[i].status;
          // const family = achievementsResult[i].achievementFamily;
          const family = achievementsResult[i].achievement.achievementFamily;
          // const startAmount = achievementsResult[i].achievementStartAmount;
          const startAmount = achievementsResult[i].achievement.startAmount;
          // const level = achievementsResult[i].achievementLevel;
          const level = achievementsResult[i].achievement.level;
          const achievement = createEntityAchievementModel({achievementId, name, description, cost, progress, progressId,
            achievementStatus, progressStatus, family, startAmount, level});
          achievements.push(achievement);
        }

        this.achievementStore.set(achievements);
      }));

    return cacheable(this.achievementStore, request$);
  }

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

  incrementAchievement(achievementFamily: string): Observable<any> {
    const functionName = 'incrementAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: achievement family: ${achievementFamily}`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            achievementFamily: achievementFamily
          };

          API.post(this.apiName, this.apiPath + '/incrementAchievement' , myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);

            // Update achievements with new progress and status
            this.updateAchievements(data.data.achievementFamilyProgress);
            observer.complete();
          });
        });
    });
  }

  incrementAchievementByX(achievementFamily: string, incrementAmount: number): Observable<any> {
    const functionName = 'incrementAchievementByX';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: achievement family: ${achievementFamily}`);
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            achievementFamily: achievementFamily,
            incrementAmount: incrementAmount,
          };

          API.post(this.apiName, this.apiPath + '/incrementAchievementByX' , myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);

            // If status returns true, update achievements with new progress and status
            if (data.data.status === true) {
              this.updateAchievements(data.data.achievementFamilyProgress);
              observer.complete();
            } else {
              observer.complete();
            }

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

            // Update achievement as acknowledged in the local store
            this.updateAchievementStatus(achievementProgressId, 'complete acknowledged');
            observer.complete();
          });
        });
    });
  }



  showStore() {
    console.log(this.achievementStore);
  }
}
