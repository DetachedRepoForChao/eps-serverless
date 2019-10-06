import { UserHasStoreItemModel } from './user-has-store-item.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/user-has-store-item-filter.model';
import {Injectable} from '@angular/core';

export interface UserHasStoreItemState extends EntityState<UserHasStoreItemModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'userHasStoreItemStore'})
@Injectable({
  providedIn: 'root'
})
export class UserHasStoreItemStore extends EntityStore<UserHasStoreItemState, UserHasStoreItemModel> {
  constructor() {
    super(initialState);
  }
}
