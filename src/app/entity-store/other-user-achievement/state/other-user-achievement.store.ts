import { OtherUserAchievementModel } from './other-user-achievement.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/other-user-achievement-filter.model';
import {Injectable} from '@angular/core';

export interface OtherUserAchievementState extends EntityState<OtherUserAchievementModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'otherUserAchievementStore'})
@Injectable({
  providedIn: 'root'
})
export class OtherUserAchievementStore extends EntityStore<OtherUserAchievementState, OtherUserAchievementModel> {
  constructor() {
    super(initialState);
  }
}
