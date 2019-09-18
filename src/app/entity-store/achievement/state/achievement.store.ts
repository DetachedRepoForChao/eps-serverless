import { AchievementModel } from './achievement.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/achievement-filter.model';
import {Injectable} from '@angular/core';

export interface AchievementState extends EntityState<AchievementModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'achievementStore'})
@Injectable({
  providedIn: 'root'
})
export class AchievementStore extends EntityStore<AchievementState, AchievementModel> {
  constructor() {
    super(initialState);
  }
}
