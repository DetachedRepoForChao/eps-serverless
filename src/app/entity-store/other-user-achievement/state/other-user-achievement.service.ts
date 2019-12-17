import { OtherUserAchievementStore } from './other-user-achievement.store';
import { OtherUserAchievementQuery} from './other-user-achievement.query';
import { createEntityOtherUserAchievementModel, OtherUserAchievementModel } from './other-user-achievement.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/other-user-achievement-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {AchievementItem} from '../../../shared/achievement/achievement.service';
import {createPointItemTransactionModel, PointItemTransactionModel} from '../../point-item-transaction/state/point-item-transaction.model';
import {EntityUserModel} from '../../user/state/entity-user.model';

@Injectable({
  providedIn: 'root'
})
export class OtherUserAchievementService {

  componentName = 'other-user-achievement.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  retrievedUserIds: number[] = [];

  constructor(private otherUserAchievementStore: OtherUserAchievementStore,
              private otherUserAchievementQuery: OtherUserAchievementQuery,
              private globals: Globals,
              private authService: AuthService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.otherUserAchievementStore.update({
      ui: {
        filter
      }
    });
  }



  add(achievementId: number, name: string, description: string, cost: number, progress: number, progressId: string,
      achievementStatus: string, progressStatus: string, family: string, startAmount: number, level: number) {

    const otherUserAchievementModel = createEntityOtherUserAchievementModel({ achievementId, name, description, cost, progress, progressId,
      achievementStatus, progressStatus, family, startAmount, level });
    this.otherUserAchievementStore.add(otherUserAchievementModel);
  }


  delete(id: ID) {
    // const functionName = 'delete';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: ${id}`);
    this.otherUserAchievementStore.remove(id);
  }

  cacheAchievements(user: EntityUserModel): Observable<any> {
    // const functionName = 'cacheAchievements';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);
    // console.log(`${functionFullName}: userId ${user.userId}`);

    return new Observable<any>(observer => {
      // Check if achievements for this user have already been cached
      if (this.retrievedUserIds.find(x => x === user.userId)) {
        // Achievements for this user have already been retrieved
        // console.log(`${functionFullName}: Achievements for user ${user.userId} have already been retrieved`);
        observer.next(false);
        observer.complete();
      } else {
        const request$ = this.getUserAchievements(user)
          .pipe(tap((achievementsResult: any) => {
            // console.log(`${functionFullName}: caching:`);
            // console.log(achievementsResult);

            const achievementsArray: OtherUserAchievementModel[] = [];
            for (const achievement of achievementsResult) {
              const progressId = achievement.id;

              // Make sure we're not adding duplicates
              if (this.otherUserAchievementQuery.getAll({filterBy: e => e.progressId === progressId}).length > 0) {
                // Duplicate. Ignore this one.
                // console.log(`ignoring achievement: ${achievement.progressId}`);
              } else {
                const userId = achievement.userId;
                const achievementId = achievement.achievementId;
                const name = achievement.achievement.name;
                const description = achievement.achievement.description;
                const cost = achievement.achievement.cost;
                const progress = achievement.goalProgress;

                const achievementStatus = achievement.achievement.status;
                const progressStatus = achievement.status;
                const family = achievement.achievement.achievementFamily;
                const startAmount = achievement.achievement.startAmount;
                const level = achievement.achievement.level;
                const roles = achievement.achievement.achievementHasRoleAudiences;
                const completedAt = achievement.completedAt;
                const acknowledgedAt = achievement.acknowledgedAt;
                const updatedAt = achievement.updatedAt;

                const otherUserAchievementModel = createEntityOtherUserAchievementModel({userId, achievementId, name, description, cost,
                  progress, progressId, achievementStatus, progressStatus, family, startAmount, level, roles, completedAt, acknowledgedAt,
                  updatedAt});

                // console.log(`adding achievement: ${achievement.progressId}`);
                achievementsArray.push(otherUserAchievementModel);
              }
            }

            // If achievements already exist in the store, we're going to add them to the array and re-push
            // when setting the store with the new values
            if (this.otherUserAchievementQuery.getAll().length > 0) {
              for (const existingAchievement of this.otherUserAchievementQuery.getAll()) {
                achievementsArray.push(existingAchievement);
              }
            }

            // console.log(`${functionFullName}: achievementsArray:`);
            // console.log(achievementsArray);
            this.otherUserAchievementStore.set(achievementsArray);
          }));

        this.retrievedUserIds.push(user.userId);
        observer.next(request$);
        observer.complete();
      }
    });
  }

  getUserAchievements(user: EntityUserModel): Observable<any> {
    // const functionName = 'getUserAchievements';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath + '/userAchievements', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  resetState() {
    this.retrievedUserIds = [];
  }
}
