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
import {UserHasStoreItemQuery} from '../../user-has-store-item/state/user-has-store-item.query';
import {StoreItemQuery} from '../../store-item/state/store-item.query';

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
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private storeItemQuery: StoreItemQuery,
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

  updatePointPool(newAmount: number) {
    this.currentUserStore.update(null, {
      pointsPool: newAmount
    });
  }

  updateExtraAttributes(userId: number, middleName: string, preferredName: string, prefix: string, suffix: string, position: string,
                        address1: string, address2: string, city: string, state: string, country: string, zip: number,
                        preferredPronoun: string, sex: string, gender: string, dateOfHire: any) {
    this.currentUserStore.update(null, {
      userId: userId,
      middleName: middleName,
      preferredName: preferredName,
      prefix: prefix,
      suffix: suffix,
      position: position,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      country: country,
      zip: zip,
      preferredPronoun: preferredPronoun,
      sex: sex,
      gender: gender,
      dateOfHire: dateOfHire,
    });
  }

  updatePointsBalance(pointsBalance: number) {
    console.log('updating points balance with: ' + pointsBalance);
    this.currentUserStore.update(null, {
      pointsBalance: pointsBalance
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
        const points = +userDataResult.points;
        const pointsPool = +userDataResult.pointsPool;

        this.getAvatarFromStorage(avatarPath)
          .subscribe((result: any) => {
            const avatarBase64String = '';
            const avatarResolvedUrl = result.avatarResolvedUrl;
            const currentUser = createEntityCurrentUserModel({username, firstName, lastName, email, birthdate, avatarBase64String,
              avatarPath, avatarResolvedUrl, department, securityRole, phone, points, pointsPool});
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
                Id: +userAttributes.attributes['custom:department_id'], // Need the '+' to cast string to number
                Name: userAttributes.attributes['custom:department'],
              };
              const securityRole: SecurityRole = {
                Id: +userAttributes.attributes['custom:security_role_id'], // Need the '+' to cast string to number
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
                points: 0,
                pointsPool: 0,
                userPicture: ''
              };

              console.log('userData:');
              console.log(data);

              if (securityRole.Id === 1) {
                this.getCurrentUserPoints()
                  .subscribe(pointsResult => {
                    data.points = pointsResult;

                    // console.log('userData:');
                    // console.log(data);
                    if (userPicture) {
                      console.log(`${functionFullName}: user picture: ${userPicture}`);

                      data.userPicture = userPicture;

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

                        data.userPicture = currentUserResult.data.avatarUrl;

                        observer.next(data);
                        observer.complete();
                      });
                    }
                  });
              } else if (securityRole.Id === 2) {
                this.getCurrentUserPointsPool()
                  .subscribe(pointsPoolResult => {
                    data.pointsPool = pointsPoolResult;

                    // console.log('userData:');
                    // console.log(data);
                    if (userPicture) {
                      console.log(`${functionFullName}: user picture: ${userPicture}`);

                      data.userPicture = userPicture;

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

                        data.userPicture = currentUserResult.data.avatarUrl;

                        observer.next(data);
                        observer.complete();
                      });
                    }
                  });
              }
            });
        });
    });
  }

  getCurrentUserPoints() {
    const functionName = 'getCurrentUserPoints';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getUserPoints', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getCurrentUserPointsPool() {
    const functionName = 'getCurrentUserPointPool';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getRemainingPointPool', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getCurrentUserFromDb() {
    const functionName = 'getCurrentUserFromDb';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/userProfile', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving user profile data from API`);
              console.log(err);
              observer.next(err);
              observer.complete();
            });
        })
        .catch(err => {
          console.log(`${functionFullName}: error getting current authenticated user from auth service`);
          console.log(err);
          observer.next(err);
          observer.complete();
        });
    });
  }

  fillRemainingAttributes(): Observable<any> {
    const functionName = 'fillRemainingAttributes';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.getCurrentUserFromDb()
        .subscribe(userResult => {
          console.log(`${functionFullName}: userResult:`);
          console.log(userResult);
          const userId = userResult.id;
          const middleName = userResult.middleName;
          const preferredName = userResult.preferredName;
          const prefix = userResult.prefix;
          const suffix = userResult.suffix;
          const position = userResult.position;
          const address1 = userResult.address1;
          const address2 = userResult.address2;
          const city = userResult.city;
          const state = userResult.state;
          const country = userResult.country;
          const zip = userResult.zip;
          const preferredPronoun = userResult.preferredPronoun;
          const sex = userResult.sex;
          const gender = userResult.gender;
          const dateOfHire = userResult.dateOfHire;

          this.updateExtraAttributes(userId, middleName, preferredName, prefix, suffix, position, address1, address2, city, state, country,
            +zip, preferredPronoun, sex, gender, dateOfHire);

          observer.next(true);
          observer.complete();
        });
    });
  }

  showStore() {
    console.log(this.currentUserStore);
  }

/*  getPendingBalance(): Observable<any> {
    return new Observable<any>(observer => {
      const pending$ = this.userHasStoreItemQuery.selectPending();
      pending$.subscribe(pendingRecords => {
        let sum = 0;

        for (let i = 0; i < pendingRecords.length; i++) {
          const storeItem = this.storeItemQuery.getAll({
            filterBy: entity => entity.itemId === pendingRecords[i].storeItemId
          })[0];

          sum += storeItem.cost;
        }

        observer.next(sum);
        observer.complete();
      });
    });
  }*/
}
