import { Injectable } from '@angular/core';
import { FeatureState, FeatureStore } from './feature.store';
import { FeatureModel } from './feature.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/feature-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeatureQuery extends QueryEntity<FeatureState, FeatureModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleFeatures = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleFeatures
  );


  constructor(protected store: FeatureStore) {
    super(store);
  }


  private getVisibleFeatures(filter, features): FeatureModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return features.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return features.filter(t => !t.completed);
      default:
        return features;
    }
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
