import { UserAvatarStore } from './user-avatar.store';
import { EntityUserAvatarQuery} from './entity-user-avatar.query';
import { createEntityUserAvatarModel, EntityUserAvatarModel } from './entity-user-avatar.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/user-avatar-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {Storage} from 'aws-amplify';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntityUserAvatarService {

  constructor(private userAvatarStore: UserAvatarStore,
              private entityUserAvatarQuery: EntityUserAvatarQuery) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.userAvatarStore.update({
      ui: {
        filter
      }
    });
  }


  complete({ id, avatarPath }: EntityUserAvatarModel) {
    this.userAvatarStore.update(id, {
      avatarPath
    });
  }


  add(username: string, avatarBase64String: string, avatarPath: string, avatarResolvedUrl: string) {
    const userAvatar = createEntityUserAvatarModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl });
    this.userAvatarStore.add(userAvatar);
  }


  delete(id: ID) {
    this.userAvatarStore.remove(id);
  }

/*  getSomething() {
    const path = 'protected/us-east-1:822e6f40-361b-4f0a-a8e8-2cfcc6547420/avatar_x186fc09kbjzjdop7j.png';
    const request$ = this.getItemFromStorage()
      .pipe(tap(item => {
        console.log(`caching: ${item}`);
        this.add('mbado', '', path, item);
      }));

    return cacheable(this.userAvatarStore, request$);
  }*/

  getSomething() {
    const path = 'protected/us-east-1:822e6f40-361b-4f0a-a8e8-2cfcc6547420/avatar_x186fc09kbjzjdop7j.png';
    const request$ = this.getItemFromStorage()
      .pipe(tap((item: string) => {
        console.log(`caching: ${item}`);
        this.add('mbado', '', path, item);
        const username: string = 'mbado';
        const avatarBase64String: string = '';
        const avatarPath: string = path;
        const avatarResolvedUrl: string = item;
        const avatar = createEntityUserAvatarModel({username, avatarBase64String, avatarPath, avatarResolvedUrl});
        this.userAvatarStore.set([avatar]);
      }));

    // return this.entityUserAvatarQuery.getHasCache() ? of() : request$;
    return cacheable(this.userAvatarStore, request$);
  }

  getItemFromStorage(): Observable<any> {
    const path = 'protected/us-east-1:822e6f40-361b-4f0a-a8e8-2cfcc6547420/avatar_x186fc09kbjzjdop7j.png';
    const key = path.split('/')[2];
    const identityId = path.split('/')[1];

    return new Observable<any>(observer => {
      Storage.get(key, {
        level: 'protected',
        identityId: identityId
      })
        .then((result: string) => {
          console.log(result);

          observer.next(result);
          observer.complete();
        });
    });
  }
}
