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

  public getNotStartedAchievements() {
    const notStartedAchievements = this.getAll({
      filterBy: achievement => achievement.progressStatus === 'not started'
    });

    return notStartedAchievements;
  }

  public getAchievementFamily(achievementFamily: string) {
    const familyAchievements = this.getAll({
      filterBy: achievement => achievement.family === achievementFamily
    });

    return familyAchievements;
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

      // Add the 'completed' achievements to the filtered achievements list
      for (let i = 0; i < completedList.length; i++) {
        // console.log(`${functionFullName}: Adding 'completed' achievement ${completedList[i].name} to the filtered list`);
        filteredList.push(completedList[i]);
      }

      // Add the 'in progress' achievements to the filtered achievements list
      for (let i = 0; i < inProgressList.length; i++) {
        // If there is a 'completed' achievement in the completed achievements list of the same family as this 'in progress'
        // achievement, do not add this achievement to the list
        const sameFamilyAchievementsList = completedList.filter(x => x.family === inProgressList[i].family);
        if (sameFamilyAchievementsList.length > 0) {
          // There is a 'completed' 'achievement of the same family as this 'in progress' achievement. The 'in progress' achievement
          // will not be added to the filtered list until the 'completed' achievement is acknowledged by the user.
          // console.log(`${functionFullName}: There is a 'completed' achievement in the '${inProgressList[i].family}' family. ` +
          //   `Not adding 'in progress' achievement '${inProgressList[i].name}' to the filtered achievement list`);
        } else {
          // console.log(`${functionFullName}: Adding 'in progress' achievement ${inProgressList[i].name} to the filtered list`);
          filteredList.push(inProgressList[i]);
        }
      }

      observer.next(filteredList);
      observer.complete();
      // return filteredList;
    });

  }

  getAchievementFamilyCount(achievement: AchievementModel): AchievementModel[] {
    return this.getAll().filter(x => x.family === achievement.family);
  }
}
