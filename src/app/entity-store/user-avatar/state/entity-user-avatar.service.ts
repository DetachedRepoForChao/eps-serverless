import { UserAvatarStore } from './user-avatar.store';
import { EntityUserAvatarQuery} from './entity-user-avatar.query';
import { createEntityUserAvatarModel, EntityUserAvatarModel } from './entity-user-avatar.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/user-avatar-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AvatarService} from '../../../shared/avatar.service';

@Injectable({
  providedIn: 'root'
})
export class EntityUserAvatarService {

  constructor(private userAvatarStore: UserAvatarStore,
              private entityUserAvatarQuery: EntityUserAvatarQuery,
              private avatarService: AvatarService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.userAvatarStore.update({
      ui: {
        filter
      }
    });
  }


  complete({ username, avatarPath }: EntityUserAvatarModel) {
    this.userAvatarStore.update(username, {
      avatarPath
    });
  }


  add(username: string, avatarBase64String: string, avatarPath: string, avatarResolvedUrl: string) {
    const userAvatar = createEntityUserAvatarModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl });
    this.userAvatarStore.add(userAvatar);
  }


  delete(username: ID) {
    console.log(`entity-user-avatar.service: delete ${username}`);
    this.userAvatarStore.remove(username);
  }

  getSomething(username: string) {
    console.log(`Retrieving avatar for ${username}`);

    let avatarPath;
    if (username === 'mbado') {
      avatarPath = 'protected/us-east-1:822e6f40-361b-4f0a-a8e8-2cfcc6547420/avatar_x186fc09kbjzjdop7j.png';
    }
    if (username === 'hulk') {
      avatarPath = 'protected/us-east-1:4d6125b2-9525-4199-a874-c798f4b6c773/avatar_iqtj43tstbijzkco2ws.png';
    }

    const request$ = this.getAvatarFromStorage(avatarPath)
      // .subscribe((item: string) => {
      .pipe(tap((item: string) => {
        console.log(`caching: ${item}`);
        // this.add(username, '', avatarPath, item);
        // const username: string = 'mbado';
        const avatarBase64String: string = '';
        // const avatarPath: string = path;
        const avatarResolvedUrl: string = item;
        const avatar = createEntityUserAvatarModel({username, avatarBase64String, avatarPath, avatarResolvedUrl});
        // this.userAvatarStore.set([avatar]);
        this.userAvatarStore.set([avatar]);
        // this.userAvatarStore.add(avatar);
        // });
      }));

    return cacheable(this.userAvatarStore, request$);
  }

  getUserAvatars() {
    console.log(`Retrieving all user avatars`);

    const request$ = this.avatarService.getUserAvatars()
      .pipe(tap((avatars: any) => {
        console.log(`caching:`);
        console.log(avatars);

        const avatarsArray: EntityUserAvatarModel[] = [];
        const observables: Observable<any>[] = [];
        for (let i = 0; i < avatars.length; i++) {
          observables.push(this.getAvatarFromStorage(avatars[i]));
        }

        forkJoin(observables)
          .subscribe((obsResult: any) => {
            for (let i = 0; i < obsResult.length; i++) {
              const username = obsResult[i].username;
              const avatarPath = obsResult[i].avatarPath;
              const avatarBase64String = '';
              const avatarResolvedUrl = obsResult[i].avatarResolvedUrl;
              const avatar = createEntityUserAvatarModel({username, avatarBase64String, avatarPath, avatarResolvedUrl});
              avatarsArray.push(avatar);
            }

            this.userAvatarStore.set(avatarsArray);
          });
      }));

    return cacheable(this.userAvatarStore, request$);
  }

  getAvatarFromStorage(userAvatarData: any): Observable<any> {
    console.log('Getting item from storage');

    const key = userAvatarData.avatarUrl.split('/')[2];
    const identityId = userAvatarData.avatarUrl.split('/')[1];

    return new Observable<any>(observer => {
      Storage.get(key, {
        level: 'protected',
        identityId: identityId
      })
        .then((result: string) => {
          console.log(result);
          const data = {
            username: userAvatarData.username,
            avatarPath: userAvatarData.avatarUrl,
            avatarResolvedUrl: result
          };

          observer.next(data);
          observer.complete();
        });
    });
  }

  showStore() {
    console.log(this.userAvatarStore);
  }
}
