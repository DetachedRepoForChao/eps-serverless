import { Injectable } from '@angular/core';
import { PointItemState, PointItemStore } from './point-item.store';
import { PointItemModel } from './point-item.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/point-item-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PointItemQuery extends QueryEntity<PointItemState, PointItemModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisiblePointItems = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisiblePointItem
  );


  constructor(protected store: PointItemStore) {
    super(store);
  }


  private getVisiblePointItem(filter, pointItems): PointItemModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return pointItems.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return pointItems.filter(t => !t.completed);
      default:
        return pointItems;
    }
  }


}
