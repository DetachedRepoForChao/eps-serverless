import { CurrentUserStore } from './current-user.store';
import { EntityCurrentUserQuery} from './entity-current-user.query';
import { createEntityCurrentUserModel, EntityCurrentUserModel } from './entity-current-user.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/current-user-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {first, tap} from 'rxjs/operators';
import {AvatarService} from '../../../shared/avatar/avatar.service';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';

@Injectable({
  providedIn: 'root'
})
export class EntityCurrentUserService {

  componentName = 'entity-user.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private currentUserStore: CurrentUserStore,
              private entityCurrentUserQuery: EntityCurrentUserQuery,
              private globals: Globals,
              private authService: AuthService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.currentUserStore.update({
      ui: {
        filter
      }
    });
  }



/*  add(username: string, avatarBase64String: string, avatarPath: string, avatarResolvedUrl: string) {
    const userAvatar = createEntityCurrentUserModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl });
    this.currentUserStore.add(userAvatar);
  }*/


  delete(id: ID) {
    console.log(`entity-user-avatar.service: delete ${id}`);
    this.currentUserStore.remove(id);
  }

  reset() {
    this.currentUserStore.reset();
  }

  updateAvatar(avatarPath: string) {
    this.getAvatarFromStorage(avatarPath)
      .subscribe((result: any) => {
        /** Update All */
        this.currentUserStore.update(null, {
          avatarPath: avatarPath,
          avatarResolvedUrl: result.avatarResolvedUrl
        });
      });
  }

  cacheCurrentUser() {
    console.log(`Retrieving current user avatar`);
    // this.userStore.setLoading(true);  // this is the initial state before doing anything
    const request$ = this.getCurrentUser()
      .pipe(tap((userDataResult: any) => {
        console.log(`caching:`);
        console.log(userDataResult);

        const username = userDataResult.username;
        const firstName = userDataResult.firstName;
        const lastName = userDataResult.lastName;
        const email = userDataResult.email;
        const birthdate = userDataResult.birthdate;
        const department = userDataResult.department;
        const securityRole = userDataResult.securityRole;
        const phone = userDataResult.phone;
        const avatarPath = userDataResult.userPicture;

        this.getAvatarFromStorage(avatarPath)
          .subscribe((result: any) => {
            const avatarBase64String = '';
            const avatarResolvedUrl = result.avatarResolvedUrl;
            const currentUser = createEntityCurrentUserModel({username, firstName, lastName, email, birthdate, avatarBase64String,
              avatarPath, avatarResolvedUrl, department, securityRole, phone});
            this.currentUserStore.set([currentUser]);
            // this.userStore.setLoading(false);  // this gets set to false automatically after store is set
          });
      }));

    return cacheable(this.currentUserStore, request$);
  }

  getAvatarFromStorage(avatarUrl: string): Observable<any> {
    console.log('Getting item from storage');

    return new Observable<any>(observer => {

      const split = avatarUrl.split('/');
      const level = split[0];
      let key;
      let identityId;
      if (level === 'public') {
        key = split.slice(1, split.length).join('/');

      } else {
        key = split.slice(2, split.length).join('/');
        identityId = split[1];
      }

      Storage.get(key, {
        level: level,
        identityId: identityId
      })
        .then((result: string) => {
          console.log(result);
          const data = {
            avatarResolvedUrl: result
          };

          observer.next(data);
          observer.complete();
        })
        .catch(err => {
          console.log(`Error retrieving url for ${avatarUrl}`);
          console.log(err);
          const data = {
            avatarResolvedUrl: ''
          };

          observer.next(data);
          observer.complete();
        });
    });
  }

  getCurrentUser(): Observable<any> {
    const functionName = 'getCurrentUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          Auth.currentUserInfo()
            .then(userAttributes => {
              console.log('userAttributes:');
              console.log(userAttributes);
              const username = userAttributes['username'];
              const firstName = userAttributes.attributes['given_name'];
              const lastName = userAttributes.attributes['family_name'];
              const email = userAttributes.attributes['email'];
              const birthdate = userAttributes.attributes['birthdate'];
              const department: Department = {
                Id: userAttributes.attributes['custom:department_id'],
                Name: userAttributes.attributes['custom:department'],
              };
              const securityRole: SecurityRole = {
                Id: userAttributes.attributes['custom:security_role_id'],
                Name: userAttributes.attributes['custom:security_role'],
                Description: null
              };
              const phone = userAttributes.attributes['phone_number'];
              const userPicture = userAttributes.attributes['picture'];

              const data = {
                username: username,
                firstName: firstName,
                lastName: lastName,
                email: email,
                birthdate: birthdate,
                department: department,
                securityRole: securityRole,
                phone: phone,
              };

              console.log('userData:');
              console.log(data);
              if (userPicture) {
                console.log(`${functionFullName}: user picture: ${userPicture}`);

                data['userPicture'] = userPicture;

                observer.next(data);
                observer.complete();
              } else {
                console.log(`${functionFullName}: unable to find user picture in user attributes... Trying to get avatar from database`);
                const token = user.signInUserSession.idToken.jwtToken;
                const myInit = this.myInit;
                myInit.headers['Authorization'] = token;

                API.get(this.apiName, this.apiPath + '/getCurrentUser', myInit).then(currentUserResult => {
                  console.log(`${functionFullName}: successfully retrieved data from API`);
                  console.log(currentUserResult);

                  data['userPicture'] = currentUserResult.data.avatarUrl;

                  observer.next(data);
                  observer.complete();
                });
              }
            });
        });
    });
  }

  showStore() {
    console.log(this.currentUserStore);
  }
}
