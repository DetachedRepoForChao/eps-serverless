import { Injectable } from '@angular/core';
import { StoreItemState, StoreItemStore } from './store-item.store';
import { StoreItemModel } from './store-item.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/store-item-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreItemQuery extends QueryEntity<StoreItemState, StoreItemModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleStoreItems = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleStoreItem
  );


  constructor(protected store: StoreItemStore) {
    super(store);
  }


  private getVisibleStoreItem(filter, storeItems): StoreItemModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return storeItems.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return storeItems.filter(t => !t.completed);
      default:
        return storeItems;
    }
  }

  public selectStoreItemById(itemId: number) {
    return this.selectAll({
      filterBy: e => e.itemId === itemId,
    });
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
