import { EntityUserAvatarModel } from './entity-user-avatar.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/user-avatar-filter.model';
import {Injectable} from '@angular/core';

export interface UserAvatarState extends EntityState<EntityUserAvatarModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'userAvatarStore'})
@Injectable({
  providedIn: 'root'
})
export class UserAvatarStore extends EntityStore<UserAvatarState, EntityUserAvatarModel> {
  constructor() {
    super(initialState);
  }
}
