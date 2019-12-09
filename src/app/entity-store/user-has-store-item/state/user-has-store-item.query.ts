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

  public selectUserRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserRequests(userId: number) {
    return this.getAll({
      filterBy: e => (e.userId === userId),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectUserPendingRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'pending'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserPendingRequests(userId: number) {
    return this.getAll({
      filterBy: e => (e.userId === userId) && (e.status === 'pending'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }


  public selectUserApprovedRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'approved'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserReadyForPickupRequests(userId: number) {
    return this.getAll({
      filterBy: e => (e.userId === userId) && (e.status === 'readyForPickup'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectUserPickedUpRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'pickedUp'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserPickedUpRequests(userId: number) {
    return this.getAll({
      filterBy: e => (e.userId === userId) && (e.status === 'pickedUp'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectUserFulfilledRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'fulfilled'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserArchivedRequests(userId: number) {
    const currentDate = Date.now();
    let otherDate;
    let dayDiff;

    return this.getAll({
      filterBy: e => {
        if (e.userId === userId) {
          if (e.status === 'pickedUp') {
            otherDate = new Date(e.pickedUpAt);
            dayDiff = (currentDate - otherDate.getTime()) / (1000 * 60 * 60 * 24);
            if (dayDiff >= 5) {
              return true;
            }
          }
          return false;
        }
      },
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserActiveRequests(userId: number) {
    const currentDate = Date.now();
    let otherDate;
    let dayDiff;

    return this.getAll({
      filterBy: e => {
        if (e.userId === userId) {
          if (e.status === 'pickedUp') {
            otherDate = new Date(e.pickedUpAt);
            dayDiff = (currentDate - otherDate.getTime()) / (1000 * 60 * 60 * 24);
            if (dayDiff >= 5) {
              return false;
            }
          }
          return true;
        }
      },
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public selectUserCancelledRequests(userId: number) {
    return this.selectAll({
      filterBy: e => (e.userId === userId) && (e.status === 'cancelled'),
      sortBy: 'createdAt',
      sortByOrder: Order.DESC
    });
  }

  public getUserCancelledRequests(userId: number) {
    return this.getAll({
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
