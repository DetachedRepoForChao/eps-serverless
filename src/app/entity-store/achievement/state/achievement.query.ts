import { Injectable } from '@angular/core';
import { AchievementState, AchievementStore } from './achievement.store';
import { AchievementModel } from './achievement.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/achievement-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AchievementQuery extends QueryEntity<AchievementState, AchievementModel> {
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
}
