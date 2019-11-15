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
import {CognitoUser, CognitoUserAttribute, ICognitoUserAttributeData} from 'amazon-cognito-identity-js';

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
    console.log(`Retrieving current user`);
    // this.userStore.setLoading(true);  // this is the initial state before doing anything
    const request$ = this.getCurrentUser()
      .pipe(tap((userDataResult: any) => {
        console.log(`caching:`);
        console.log(userDataResult);

        const userId = userDataResult.id;
        const username = userDataResult.username;
        const firstName = userDataResult.firstName;
        const middleName = userDataResult.middleName;
        const lastName = userDataResult.lastName;
        const preferredName = userDataResult.preferredName;
        const prefix = userDataResult.prefix;
        const suffix = userDataResult.suffix;
        const position = userDataResult.position;
        const points = +userDataResult.points;
        const pointsPool = +userDataResult.pointsPool;
        const email = userDataResult.email;
        const address1 = userDataResult.address1;
        const address2 = userDataResult.address2;
        const city = userDataResult.city;
        const state = userDataResult.state;
        const country = userDataResult.country;
        const zip = userDataResult.zip;
        const birthdate = userDataResult.birthdate;
        const preferredPronoun = userDataResult.preferredPronoun;
        const sex = userDataResult.sex;
        const gender = userDataResult.gender;
        const dateOfHire = userDataResult.dateOfHire;
        const department = userDataResult.department;
        const securityRole = userDataResult.securityRole;
        const phone = userDataResult.phone.substring(2);
        const avatarPath = userDataResult.avatarPath;

        this.getAvatarFromStorage(avatarPath)
          .subscribe((result: any) => {
            const avatarBase64String = '';
            const avatarResolvedUrl = result.avatarResolvedUrl;
            const currentUser = createEntityCurrentUserModel({userId, username, firstName, middleName, lastName, preferredName, prefix,
              suffix, position, points, pointsPool, email, address1, address2, city, state, country, zip, birthdate, preferredPronoun, sex,
              gender, dateOfHire, department, securityRole, phone, avatarBase64String, avatarPath, avatarResolvedUrl});
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

  // TODO: Rework this function to not rely on Cognito attributes
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
                .subscribe(currentUser => {
/*                  const username = userAttributes['username'];
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
                  const userPicture = userAttributes.attributes['picture'];*/

                  const userId = currentUser.id;
                  const username = currentUser.username;
                  const firstName = currentUser.firstName;
                  const lastName = currentUser.lastName;
                  const middleName = currentUser.middleName;
                  const preferredName = currentUser.preferredName;
                  const prefix = currentUser.prefix;
                  const suffix = currentUser.suffix;
                  const position = currentUser.position;
                  const points = currentUser.points;
                  let pointsPool = null;
                  if (currentUser.pointPool) {
                    pointsPool = (currentUser.pointPool.pointsRemaining) ? currentUser.pointPool.pointsRemaining : null;
                  }
                  const email = currentUser.email;
                  const address1 = currentUser.address1;
                  const address2 = currentUser.address2;
                  const city = currentUser.city;
                  const state = currentUser.state;
                  const country = currentUser.country;
                  const zip = currentUser.zip;
                  const dateOfBirth = currentUser.dateOfBirth;
                  const preferredPronoun = currentUser.preferredPronoun;
                  const sex = currentUser.sex;
                  const gender = currentUser.gender;
                  const dateOfHire = currentUser.dateOfHire;
                  const phone = currentUser.phone;
                  // const securityRoleId = currentUser.securityRoleId;
                  // const securityRoleName = currentUser.SecurityRole.name;
                  // const departmentId = currentUser.departmentId;
                  // const departmentName = currentUser.Department.name;
                  const department: Department = {
                    Id: currentUser.departmentId,
                    Name: currentUser.department.name,
                  };
                  const securityRole: SecurityRole = {
                    Id: currentUser.securityRoleId,
                    Name: currentUser.securityRole.name,
                    Description: currentUser.securityRole.description
                  };
                  const avatarUrl = currentUser.avatarUrl;

                  const data = {
                    userId: userId,
                    username: username,
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    preferredName: preferredName,
                    prefix: prefix,
                    suffix: suffix,
                    position: position,
                    points: points,
                    pointsPool: pointsPool,
                    email: email,
                    address1: address1,
                    address2: address2,
                    city: city,
                    state: state,
                    country: country,
                    zip: zip,
                    birthdate: dateOfBirth,
                    preferredPronoun: preferredPronoun,
                    sex: sex,
                    gender: gender,
                    dateOfHire: dateOfHire,
                    phone: phone,
                    department: department,
                    securityRole: securityRole,
                    avatarPath: avatarUrl,
                  };

                  console.log('userData:');
                  console.log(data);

                  observer.next(data);
                  observer.complete();

/*                  if (securityRole.Id === 1) {
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
                  }*/
                });


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
