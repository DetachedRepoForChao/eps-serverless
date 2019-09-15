import { UserStore } from './user.store';
import { EntityUserQuery} from './entity-user.query';
import { createEntityUserModel, EntityUserModel } from './entity-user.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/user-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AvatarService} from '../../../shared/avatar/avatar.service';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EntityUserService {

  componentName = 'entity-user.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private userStore: UserStore,
              private entityUserQuery: EntityUserQuery,
              private globals: Globals,
              private authService: AuthService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.userStore.update({
      ui: {
        filter
      }
    });
  }



  add(username: string, avatarBase64String: string, avatarPath: string, avatarResolvedUrl: string) {
    const userAvatar = createEntityUserModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl });
    this.userStore.add(userAvatar);
  }


  delete(id: ID) {
    console.log(`entity-user-avatar.service: delete ${id}`);
    this.userStore.remove(id);
  }

  reset() {
    this.userStore.reset();
  }

  update(avatarPath: string, avatarResolvedUrl: string) {
    /*
        this.userStore.update((e) => e.username === username, {
          avatarPath: avatarPath,
          avatarResolvedUrl: avatarResolvedUrl
        });
    */

    /** Update All */
    this.userStore.update(null, {
      avatarPath: avatarPath,
      avatarResolvedUrl: avatarResolvedUrl
    });
  }

  cacheCurrentUserAvatar() {
    console.log(`Retrieving current user avatar`);
    // this.userStore.setLoading(true);  // this is the initial state before doing anything
    const request$ = this.getCurrentUserAvatar()
      .pipe(tap((avatarResult: any) => {
        console.log(`caching:`);
        console.log(avatarResult);

        this.getAvatarFromStorage(avatarResult)
          .subscribe((result: any) => {
            const username = result.username;
            const avatarPath = result.avatarPath;
            const avatarBase64String = '';
            const avatarResolvedUrl = result.avatarResolvedUrl;
            const avatar = createEntityUserModel({username, avatarBase64String, avatarPath, avatarResolvedUrl});
            this.userStore.set([avatar]);
            // this.userStore.setLoading(false);  // this gets set to false automatically after store is set
          });
      }));

    return cacheable(this.userStore, request$);
  }

  getAvatarFromStorage(userAvatarData: any): Observable<any> {
    console.log('Getting item from storage');

    return new Observable<any>(observer => {

      const split = userAvatarData.avatarUrl.split('/');
      const level = split[0];
      let key;
      let identityId;
      if (level === 'public') {
        key = split.slice(1, split.length).join('/');

      } else {
        key = split.slice(2, split.length).join('/');
        identityId = split[1];
      }

      // console.log(`avatar key: ${key}`);

      Storage.get(key, {
        level: level,
        identityId: identityId
      })
        .then((result: string) => {
          console.log(result);
          const data = {
            username: this.globals.getUsername(),
            avatarPath: userAvatarData.avatarUrl,
            avatarResolvedUrl: result
          };

          observer.next(data);
          observer.complete();
        })
        .catch(err => {
          console.log(`Error retrieving url for ${userAvatarData.avatarUrl}`);
          console.log(err);
          const data = {
            username: this.globals.getUsername(),
            avatarPath: userAvatarData.avatarUrl,
            avatarResolvedUrl: ''
          };

          observer.next();
          observer.complete();
        });
    });
  }

  getCurrentUserAvatar(): Observable<any> {
    const functionName = 'getCurrentUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // const username = this.globals.getUsername();
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          // const userPicture = this.globals.getUserAttribute('picture');
          Auth.currentUserInfo()
            .then(userAttributes => {
              const userPicture = userAttributes.picture;
              if (userPicture) {
                console.log(`${functionFullName}: user picture: ${userPicture}`);
                const data = {
                  status: true,
                  avatarUrl: userPicture
                };
                observer.next(data);
                observer.complete();
              } else {
                console.log(`${functionFullName}: unable to find user picture in user attributes... Trying to get avatar from database`);
                const token = user.signInUserSession.idToken.jwtToken;
                const myInit = this.myInit;
                myInit.headers['Authorization'] = token;
                // myInit['body'] = {username: username};

                API.get(this.apiName, this.apiPath + '/getCurrentUserAvatar', myInit).then(data => {
                  console.log(`${functionFullName}: successfully retrieved data from API`);
                  console.log(data);
                  observer.next(data.data);
                  observer.complete();
                });
              }
            });
        });
    });
  }

  showStore() {
    console.log(this.userStore);
  }
}
