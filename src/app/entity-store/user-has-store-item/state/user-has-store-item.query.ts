import { Injectable } from '@angular/core';
import { UserHasStoreItemState, UserHasStoreItemStore } from './user-has-store-item.store';
import { UserHasStoreItemModel } from './user-has-store-item.model';
import { StoreItemQuery} from '../../store-item/state/store-item.query';
import { StoreItemStore} from '../../store-item/state/store-item.store';
import {Order, QueryEntity} from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/user-has-store-item-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserHasStoreItemQuery extends QueryEntity<UserHasStoreItemState, UserHasStoreItemModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleStoreItems = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleUserHasStoreItem
  );


  constructor(protected store: UserHasStoreItemStore) {
    super(store);
  }


  private getVisibleUserHasStoreItem(filter, storeItems): UserHasStoreItemModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return storeItems.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return storeItems.filter(t => !t.completed);
      default:
        return storeItems;
    }
  }

  public selectPending() {
    return this.selectAll({
      filterBy: entity => entity.status === 'pending'
    });
  }

  public selectCurrentUserRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectCurrentUserPendingRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'pending'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectCurrentUserDeclinedRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'declined'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectCurrentUserFulfilledRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'fulfilled'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectCurrentUserCancelledRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'cancelled'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
