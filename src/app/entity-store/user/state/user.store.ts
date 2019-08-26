import { EntityUserModel } from './entity-user.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/user-filter.model';
import {Injectable} from '@angular/core';

export interface UserState extends EntityState<EntityUserModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'userStore'})
@Injectable({
  providedIn: 'root'
})
export class UserStore extends EntityStore<UserState, EntityUserModel> {
  constructor() {
    super(initialState);
  }
}
