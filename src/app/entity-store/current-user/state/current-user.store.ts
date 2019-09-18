import { EntityCurrentUserModel } from './entity-current-user.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/current-user-filter.model';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Storage} from 'aws-amplify';

export interface CurrentUserState extends EntityState<EntityCurrentUserModel> {
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
export class CurrentUserStore extends EntityStore<CurrentUserState, EntityCurrentUserModel> {
  constructor() {
    super(initialState);
  }

/*  akitaPreUpdateEntity(prevEntityCurrentUser: EntityCurrentUserModel, nextEntityCurrentUser: EntityCurrentUserModel) {
    // return the same entity or modify it
    // Check if the avatarPath changed. If changed, resolve new path
    if (prevEntityCurrentUser.avatarPath !== nextEntityCurrentUser.avatarPath) {
      this.avatarService.getAvatarFromStorage(prevEntityCurrentUser.avatarPath)
        .subscribe((result: any) => {
          nextEntityCurrentUser.avatarResolvedUrl = result.avatarResolvedUrl;
          return nextEntityCurrentUser;
        });
    } else {
      return nextEntityCurrentUser;
    }
  }*/
}
