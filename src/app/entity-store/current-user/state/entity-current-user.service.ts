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
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {UserHasStoreItemQuery} from '../../user-has-store-item/state/user-has-store-item.query';
import {StoreItemQuery} from '../../store-item/state/store-item.query';
import {CognitoUser, CognitoUserAttribute, ICognitoUserAttributeData} from 'amazon-cognito-identity-js';

@Injectable({
  providedIn: 'root'
})
export class EntityCurrentUserService {

  componentName = 'entity-current-user.service';
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
              private authService: AuthService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.currentUserStore.update({
      ui: {
        filter
      }
    });
  }


  update(user) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(user);

    const userUpdate = {};
    const keys = Object.keys(user);

    for (let i = 0; i < keys.length; i++) {
      if ((keys[i] === 'phone') && (user[keys[i]].includes('+1'))) {
        userUpdate[keys[i]] = user[keys[i]].substring(2);
      } else {
        userUpdate[keys[i]] = user[keys[i]];
      }
    }

    console.log(userUpdate);

    this.currentUserStore.update((e) => e.username === user.username, userUpdate);
  }

  delete(id: ID) {
    console.log(`entity-user.service: delete ${id}`);
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

  updatePoints(newAmount: number) {
    this.currentUserStore.update(null, {
      points: newAmount
    });
  }


  cacheCurrentUser() {
    console.log(`Retrieving current user`);
    // this.userStore.setLoading(true);  // this is the initial state before doing anything
    const request$ = this.getCurrentUser()
      .pipe(tap((userDataResult: any) => {
        console.log(`caching:`);
        console.log(userDataResult);

        const userId = userDataResult.userId;
        const username = userDataResult.username;
        const firstName = userDataResult.firstName;
        const middleName = userDataResult.middleName;
        const lastName = userDataResult.lastName;
        const preferredName = userDataResult.preferredName;
        const position = userDataResult.position;
        const points = +userDataResult.points;
        const pointsPool = +userDataResult.pointsPool;
        const email = userDataResult.email;
        const birthdate = userDataResult.birthdate;
        const gender = userDataResult.gender;
        const dateOfHire = userDataResult.dateOfHire;
        const department = userDataResult.department;
        const securityRole = userDataResult.securityRole;
        const phone = userDataResult.phone.substring(2);
        const avatarPath = userDataResult.avatarPath;
        const quote = userDataResult.quote;
        const phonePublic = userDataResult.phonePublic;
        const emailPublic = userDataResult.emailPublic;
        const genderPublic = userDataResult.genderPublic;
        const birthdatePublic = userDataResult.birthdatePublic;
        const pointAwardsPublic = userDataResult.pointAwardsPublic;
        const achievementsPublic = userDataResult.achievementsPublic;
        const pointsPublic = userDataResult.pointsPublic;
        const coreValuesPublic = userDataResult.coreValuesPublic;
        const emailNotifications = userDataResult.emailNotifications;
        const phoneNotifications = userDataResult.phoneNotifications;
        const awardManager = userDataResult.awardManager;

        this.getAvatarFromStorage(avatarPath)
          .subscribe((result: any) => {
            const avatarResolvedUrl = result.avatarResolvedUrl;
            const currentUser = createEntityCurrentUserModel({userId, username, firstName, middleName, lastName, preferredName, position,
              points, pointsPool, email, birthdate, gender, dateOfHire, department, securityRole, phone, avatarPath, avatarResolvedUrl,
              quote, phonePublic, emailPublic, genderPublic, birthdatePublic, pointAwardsPublic, achievementsPublic, pointsPublic,
              coreValuesPublic, emailNotifications, phoneNotifications, awardManager});
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

              this.getCurrentUserFromDb()
                .subscribe(currentUserData => {
                  const userId = currentUserData.user.id;
                  const username = currentUserData.user.username;
                  const firstName = currentUserData.user.firstName;
                  const lastName = currentUserData.user.lastName;
                  const middleName = currentUserData.user.middleName;
                  const preferredName = currentUserData.user.preferredName;
                  const position = currentUserData.user.position;
                  const points = currentUserData.user.points;
                  let pointsPool = null;
                  if (currentUserData.user.pointPool) {
                    pointsPool = (currentUserData.user.pointPool.pointsRemaining) ? currentUserData.user.pointPool.pointsRemaining : null;                  }
                  const email = currentUserData.user.email;
                  const dateOfBirth = currentUserData.user.dateOfBirth;
                  const gender = currentUserData.user.gender;
                  const dateOfHire = currentUserData.user.dateOfHire;
                  const phone = currentUserData.user.phone;
                  const department: Department = {
                    Id: currentUserData.user.departmentId,
                    Name: currentUserData.user.department.name,
                  };
                  const securityRole: SecurityRole = {
                    Id: currentUserData.user.securityRoleId,
                    Name: currentUserData.user.securityRole.name,
                    Description: currentUserData.user.securityRole.description
                  };
                  const avatarUrl = currentUserData.user.avatarUrl;
                  const quote = currentUserData.user.quote;
                  const phonePublic = currentUserData.user.phonePublic;
                  const emailPublic = currentUserData.user.emailPublic;
                  const genderPublic = currentUserData.user.genderPublic;
                  const birthdatePublic = currentUserData.user.birthdatePublic;
                  const pointAwardsPublic = currentUserData.user.pointAwardsPublic;
                  const achievementsPublic = currentUserData.user.achievementsPublic;
                  const pointsPublic = currentUserData.user.pointsPublic;
                  const coreValuesPublic = currentUserData.user.coreValuesPublic;
                  const emailNotifications = currentUserData.user.emailNotifications;
                  const phoneNotifications = currentUserData.user.phoneNotifications;
                  const awardManager = currentUserData.user.awardManager;

                  const data = {
                    userId: userId,
                    username: username,
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    preferredName: preferredName,
                    position: position,
                    points: points,
                    pointsPool: pointsPool,
                    email: email,
                    birthdate: dateOfBirth,
                    gender: gender,
                    dateOfHire: dateOfHire,
                    phone: phone,
                    department: department,
                    securityRole: securityRole,
                    avatarPath: avatarUrl,
                    quote: quote,
                    phonePublic: phonePublic,
                    emailPublic: emailPublic,
                    genderPublic: genderPublic,
                    birthdatePublic: birthdatePublic,
                    pointAwardsPublic: pointAwardsPublic,
                    achievementsPublic: achievementsPublic,
                    pointsPublic: pointsPublic,
                    coreValuesPublic: coreValuesPublic,
                    emailNotifications: emailNotifications,
                    phoneNotifications: phoneNotifications,
                    awardManager: awardManager,
                  };

                  console.log('userData:');
                  console.log(data);

                  observer.next(data);
                  observer.complete();
                });

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


  modifyUser(user): Observable<any> {
    const functionName = 'modifyUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          this.updateCognitoAttributes(user)
            .subscribe(updateResult => {
              console.log(updateResult);

              if (updateResult === 'SUCCESS') {
                const token = currentUser.signInUserSession.idToken.jwtToken;
                const myInit = this.myInit;
                myInit.headers['Authorization'] = token;

                myInit['body'] = {
                  user: user
                };

                API.post(this.apiName, this.apiPath + '/modifyUser', myInit)
                  .then(data => {
                    console.log(`${functionFullName}: data retrieved from API`);
                    console.log(data);

                    if (data.data.status !== false) {
                      // Update the user in the local Akita store
                      this.update(user);

                      observer.next(data.data);
                      observer.complete();
                    } else {
                      observer.next(data.data);
                      observer.complete();
                    }
                  })
                  .catch(err => {
                    console.log(`${functionFullName}: error making API call`);
                    console.log(err);
                    observer.next(err);
                    observer.complete();
                  });
              }

              observer.next(updateResult);
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

  updateCognitoAttributes(user): Observable<any> {
    const functionName = 'updateCognitoAttributes';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then((currentUser: CognitoUser) => {
          const attributeList = [];
          const keys = Object.keys(user);

          for (let i = 0; i < keys.length; i++) {
            switch (keys[i]) {
              case 'birthdate': {
                attributeList.push({
                  Name: 'birthdate',
                  Value: user.birthdate,
                });
                break;
              }
              case 'preferredName': {
                attributeList.push({
                  Name: 'name',
                  Value: user.preferredName,
                });
                break;
              }
              case 'email': {
                attributeList.push({
                  Name: 'email',
                  Value: user.email,
                });
                break;
              }
              case 'phone': {
                attributeList.push({
                  Name: 'phone_number',
                  Value: user.phone,
                });
                break;
              }
              case 'gender': {
                attributeList.push({
                  Name: 'gender',
                  Value: user.gender,
                });
                break;
              }
            }
          }

          // const attributeObj = new CognitoUserAttribute(attribute);
          // attributeList.push(attributeObj);
          console.log('attributeList:');
          console.log(attributeList);

          currentUser.updateAttributes(attributeList, function(err, result) {
            if (err) {
              console.log(err);
              observer.next(err);
              observer.complete();
              return;
            }
            console.log('call result: ' + result);
            observer.next(result);
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

}
