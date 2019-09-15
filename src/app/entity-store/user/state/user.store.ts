import { EntityUserModel } from './entity-user.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/user-filter.model';
import {Injectable} from '@angular/core';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';
import {Observable} from 'rxjs';
import {Storage} from 'aws-amplify';

export interface UserState extends EntityState<EntityUserModel> {
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
export class UserStore extends EntityStore<UserState, EntityUserModel> {
  constructor() {
    super(initialState);
  }

/*  akitaPreUpdateEntity(prevEntityUser: EntityUserModel, nextEntityUser: EntityUserModel) {
    // return the same entity or modify it
    // Check if the avatarPath changed. If changed, resolve new path
    if (prevEntityUser.avatarPath !== nextEntityUser.avatarPath) {
      this.getAvatarFromStorage(prevEntityUser.avatarPath)
        .subscribe((result: any) => {
          nextEntityUser.avatarResolvedUrl = result.avatarResolvedUrl;
          return nextEntityUser;
        });
    } else {
      return nextEntityUser;
    }
  }*/
}
