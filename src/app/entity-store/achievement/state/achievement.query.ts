import { Injectable } from '@angular/core';
import { AchievementState, AchievementStore } from './achievement.store';
import { AchievementModel } from './achievement.model';
import { QueryEntity } from '@datorama/akita';
import {combineLatest, Observable} from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/achievement-filter.model';
import { map } from 'rxjs/operators';
import {AchievementItem} from '../../../shared/achievement/achievement.service';

@Injectable({
  providedIn: 'root'
})
export class AchievementQuery extends QueryEntity<AchievementState, AchievementModel> {
  componentName = 'achievement.query';

  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleAchievements$ = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleAchievements
  );


  constructor(protected store: AchievementStore) {
    super(store);
  }


  private getVisibleAchievements(filter, achievements): AchievementModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return achievements.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return achievements.filter(t => !t.completed);
      default:
        return achievements;
    }
  }

  public getCurrentUserAchievements() {
    const currentUserAchievements = this.getAll();
    return currentUserAchievements;
  }

  public getInProgressAchievements() {
    const inProgressAchievements = this.getAll({
      filterBy: achievement => achievement.progressStatus === 'in progress'
    });

    return inProgressAchievements;
  }

  public getCompletedAchievements() {
    const completedAchievements = this.getAll({
      filterBy: achievement => achievement.progressStatus === 'complete'
    });

    return completedAchievements;
  }

  public getFinishedAchievements() {
    const finishedAchievements = this.getAll({
      filterBy: achievement => achievement.progressStatus === 'complete' || achievement.progressStatus === 'complete acknowledged'
    });

    return finishedAchievements;
  }

  public selectFinishedAchievements() {
    return this.selectAll({
      filterBy: achievement => achievement.progressStatus === 'complete' || achievement.progressStatus === 'complete acknowledged'
    });
  }

  public getNotStartedAchievements() {
    const notStartedAchievements = this.getAll({
      filterBy: achievement => achievement.progressStatus === 'not started'
    });

    return notStartedAchievements;
  }

  public getAchievementFamily(achievementFamily: string) {
    return this.getAll({
      filterBy: achievement => achievement.family === achievementFamily
    });
  }

  filterAchievements(): Observable<AchievementModel[]> {
    return new Observable<any>(observer => {
      const achievementsList = this.getAll();
      const functionName = 'filterAchievements';
      const functionFullName = `${this.componentName} ${functionName}`;
      // console.log(`Start ${functionFullName}`);

      // console.log(achievementsList);

      const filteredList: AchievementModel[] = [];
      const completedList = this.getCompletedAchievements();
      const inProgressList = this.getInProgressAchievements();

      // Add the 'complete' achievements to the filtered achievements list
      for (let i = 0; i < completedList.length; i++) {
        // console.log(`${functionFullName}: Adding 'complete' achievement ${completedList[i].name} to the filtered list`);
        filteredList.push(completedList[i]);
      }

      // Add the 'in progress' achievements to the filtered achievements list
      for (let i = 0; i < inProgressList.length; i++) {
        // If there is a 'complete' achievement in the completed achievements list of the same family as this 'in progress'
        // achievement, do not add this achievement to the list
        const sameFamilyAchievementsList = completedList.filter(x => x.family === inProgressList[i].family);
        if (sameFamilyAchievementsList.length > 0) {
          // There is a 'complete' achievement of the same family as this 'in progress' achievement. The 'in progress' achievement
          // will not be added to the filtered list until the 'completed' achievement is acknowledged by the user.
          // console.log(`${functionFullName}: There is a 'completed' achievement in the '${inProgressList[i].family}' family. ` +
          //   `Not adding 'in progress' achievement '${inProgressList[i].name}' to the filtered achievement list`);
        } else {
          // console.log(`${functionFullName}: Adding 'in progress' achievement ${inProgressList[i].name} to the filtered list`);
          filteredList.push(inProgressList[i]);
        }
      }

      // console.log(`${functionFullName}: filteredList:`);
      // console.log(filteredList);

      observer.next(filteredList);
      observer.complete();
      // return filteredList;
    });

  }

  getFilteredAchievementsList() {
    const achievementsList = this.getAll();
    const functionName = 'filterAchievements';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(achievementsList);

    const filteredList: AchievementModel[] = [];
    const completedList = this.getCompletedAchievements();
    const inProgressList = this.getInProgressAchievements();

    // Add the 'complete' achievements to the filtered achievements list
    for (let i = 0; i < completedList.length; i++) {
      // console.log(`${functionFullName}: Adding 'complete' achievement ${completedList[i].name} to the filtered list`);
      filteredList.push(completedList[i]);
    }

    // Add the 'in progress' achievements to the filtered achievements list
    for (let i = 0; i < inProgressList.length; i++) {
      // If there is a 'complete' achievement in the completed achievements list of the same family as this 'in progress'
      // achievement, do not add this achievement to the list
      const sameFamilyAchievementsList = completedList.filter(x => x.family === inProgressList[i].family);
      if (sameFamilyAchievementsList.length > 0) {
        // There is a 'complete' achievement of the same family as this 'in progress' achievement. The 'in progress' achievement
        // will not be added to the filtered list until the 'completed' achievement is acknowledged by the user.
        // console.log(`${functionFullName}: There is a 'completed' achievement in the '${inProgressList[i].family}' family. ` +
        //   `Not adding 'in progress' achievement '${inProgressList[i].name}' to the filtered achievement list`);
      } else {
        // console.log(`${functionFullName}: Adding 'in progress' achievement ${inProgressList[i].name} to the filtered list`);
        filteredList.push(inProgressList[i]);
      }
    }

    // console.log(`${functionFullName}: filteredList:`);
    // console.log(filteredList);


    return filteredList;
  }

  // Returns number of achievements in the achievement family
  getAchievementFamilyCount(achievement: AchievementModel): AchievementModel[] {
    return this.getAll().filter(x => x.family === achievement.family);
  }

  getAchievementFamilies(): Observable<any> {
    // groupBy function reference: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
    // I'm not sure why or how this works...
    const groupBy = function (xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    return new Observable<any>(observer => {
      this.selectAll()
        .subscribe(result => {
          const families = groupBy(result, 'family');
          observer.next(families);
          observer.complete();
        });
    });


    // debugger;
    // console.log(families);
    // return families;
  }

  getCompleteAchievements(): AchievementModel[] {
    return this.getAll().filter(x => ((x.progressStatus === 'complete') || (x.progressStatus === 'complete acknowledged')));
  }

  getCompleteAchievementById(id: number) {
    const achievement = this.getCompleteAchievements().filter(x => x.achievementId === id)[0];
    if (!achievement) {
      return false;
    } else {
      return true;
    }
  }
}
