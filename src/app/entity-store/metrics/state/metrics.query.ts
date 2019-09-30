import { Injectable } from '@angular/core';
import { MetricsState, MetricsStore } from './metrics.store';
import { MetricsModel } from './metrics.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/metrics-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MetricsQuery extends QueryEntity<MetricsState, MetricsModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleMetrics = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleMetrics
  );


  constructor(protected store: MetricsStore) {
    super(store);
  }


  private getVisibleMetrics(filter, metrics): MetricsModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return metrics.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return metrics.filter(t => !t.completed);
      default:
        return metrics;
    }
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
