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
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {SecurityRole} from '../../../shared/securityrole.model';
import {Department} from '../../../shared/department.model';
import {FormGroup} from '@angular/forms';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class EntityUserService {
  componentName = 'entity-user.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  apiPath2 = '/things';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };
  user$: any;

  constructor(private userStore: UserStore,
              private entityUserQuery: EntityUserQuery,
              private authService: AuthService) { }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.userStore.update({
      ui: {
        filter
      }
    });
  }


  complete({ username, avatarPath }: EntityUserModel) {
    this.userStore.update(username, {
      avatarPath
    });
  }


  add(username: string, avatarBase64String: string, avatarPath: string, avatarResolvedUrl: string) {
    const user = createEntityUserModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl });
    this.userStore.add(user);
  }


  delete(userId: number) {
    console.log(`entity-user.service: delete ${userId}`);
    this.userStore.remove((e) => e.userId === userId);
  }

  reset() {
    this.userStore.reset();
  }

  updateAvatar(username: string, avatarPath: string) {
    const data = {
      avatarUrl: avatarPath
    };
    this.getAvatarFromStorage(data.avatarUrl)
      .subscribe((result: any) => {
        this.userStore.update((e) => e.username === username, {
          avatarPath: avatarPath,
          avatarResolvedUrl: result.avatarResolvedUrl
        });
      });
  }

  updatePoints(userId: number, newAmount: number) {
    this.userStore.update((e) => e.userId === userId, {
      points: newAmount
    });
  }

  update(user) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(user);
    // console.log(`${functionFullName}: update ${user.firstName} ${user.lastName}`);

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

    this.userStore.update((e) => e.userId === user.userId, userUpdate);
  }

  setActive(userId: number) {
    this.userStore.update((e) => e.userId === userId, {
      active: true
    });
  }

  setInactive(userId: number) {
    this.userStore.update((e) => e.userId === userId, {
      active: false
    });
  }

  updateCognitoAttributes(user): Observable<any> {
    const functionName = 'updateCognitoAttributes';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath2 + '/setCognitoUserAttributes', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error setting Cognito attributes`);
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

  cacheUsers() {
    console.log(`Retrieving all users public details`);
    // this.userAvatarStore.setLoading(true);  // this is the initial state before doing anything
    const request$ = this.getUsers()
      .pipe(tap((users: any) => {
        console.log(`caching:`);
        console.log(users);

        // Merge into single array
        const usersMerged = [];
        for (let i = 0; i < users[0].users.length; i++) {
          const newUserObj = users[0].users[i];
          for (let j = 0; j < users[1].usersCompleteAchievementTotal.length; j++) {
            if (users[1].usersCompleteAchievementTotal[j].userId === newUserObj.id) {
              newUserObj['completeAchievementsTotal'] = users[1].usersCompleteAchievementTotal[j].num_complete;
              break;
            }
          }

          usersMerged.push(newUserObj);
        }

        console.log('usersMerged');
        console.log(usersMerged);

        const usersArray: EntityUserModel[] = [];
        const observables: Observable<any>[] = [];
        for (let i = 0; i < usersMerged.length; i++) {
          observables.push(this.getAvatarFromStorage(usersMerged[i].avatarUrl));
        }

        forkJoin(observables)
          .subscribe((obsResult: any) => {
            for (let i = 0; i < obsResult.length; i++) {
              const userId = usersMerged[i].id;
              const username = usersMerged[i].username;
              const firstName = usersMerged[i].firstName;
              const lastName = usersMerged[i].lastName;
              const middleName = usersMerged[i].middleName;
              const preferredName = usersMerged[i].preferredName;
              const position = usersMerged[i].position;
              const points = usersMerged[i].points;
              const preferredPronoun = usersMerged[i].preferredPronoun;
              const birthdate = usersMerged[i].dateOfBirth;
              const email = usersMerged[i].email;
              const securityRole: SecurityRole = {
                Id: +usersMerged[i].securityRole.id,
                Name: usersMerged[i].securityRole.name,
                Description: usersMerged[i].securityRole.description
              };
              const department: Department = {
                Id: +usersMerged[i].department.id,
                Name: usersMerged[i].department.name
              };

              // Properties visible to admins
              const address1 = (usersMerged[i].address1) ? usersMerged[i].address1 : null;
              const address2 = (usersMerged[i].address2) ? usersMerged[i].address2 : null;
              const city = (usersMerged[i].city) ? usersMerged[i].city : null;
              const state = (usersMerged[i].state) ? usersMerged[i].state : null;
              const country = (usersMerged[i].country) ? usersMerged[i].country : null;
              const zip = (usersMerged[i].zip) ? usersMerged[i].zip : null;
              const dateOfHire = (usersMerged[i].dateOfHire) ? usersMerged[i].dateOfHire : null;
              const dateOfTermination = (usersMerged[i].dateOfTermination) ? usersMerged[i].dateOfTermination : null;
              const phone = (usersMerged[i].phone) ? usersMerged[i].phone.substring(2) : null;
              const active = (usersMerged[i].active) ? usersMerged[i].active : null;
              const sex = (usersMerged[i].sex) ? usersMerged[i].sex : null;
              const gender = (usersMerged[i].gender) ? usersMerged[i].gender : null;

              const completeAchievementsTotal = usersMerged[i].completeAchievementsTotal;
              const avatarPath = usersMerged[i].avatarUrl;
              const avatarBase64String = '';
              const avatarResolvedUrl = obsResult[i].avatarResolvedUrl;
              const avatar = createEntityUserModel({userId, username, firstName, lastName, middleName, position, points, birthdate,
                securityRole, department, avatarBase64String, avatarPath, avatarResolvedUrl, completeAchievementsTotal, email,
                preferredName, preferredPronoun, address1, address2, city, country, state, zip, dateOfHire, dateOfTermination, phone,
                active, sex, gender});
              usersArray.push(avatar);
            }

            this.userStore.set(usersArray);
            // this.userAvatarStore.setLoading(false);  // this gets set to false automatically after store is set
          });
      }));

    return cacheable(this.userStore, request$);
  }

  getAvatarFromStorage(avatarUrl: string): Observable<any> {
    const functionName = 'getAvatarFromStorage';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

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
          // console.log(`${functionFullName}: result: ${result}`);
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

  getUserAvatars(): Observable<any> {
    const functionName = 'getUserAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getUserAvatars', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving user avatars data from API`);
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



  getUsers(): Observable<any> {
    const functionName = 'getUsers';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          Auth.currentUserInfo()
            .then(userAttributes => {
              let apiCall = '/usersPublicDetails2';
              if (+userAttributes.attributes['custom:security_role_id'] === 3) {
                apiCall = '/adminUsersDetails';
              }
              const token = user.signInUserSession.idToken.jwtToken;
              const myInit = this.myInit;
              myInit.headers['Authorization'] = token;

              API.get(this.apiName, this.apiPath + apiCall, myInit).then(data => {
                console.log(`${functionFullName}: successfully retrieved data from API`);
                console.log(data);
                console.log(data.data);
                observer.next(data.data);
                observer.complete();
              })
                .catch(err => {
                  console.log(`${functionFullName}: error retrieving users details from API`);
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

    });
  }

  getuserName():string []{
    this.user$= this.getUsers().subscribe()
    const username:string [] = this.user$.username
    return username;
  }


  modifyUser(user): Observable<any> {
    const functionName = 'modifyUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath + '/modifyUser', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);

            if (data.data.status !== false) {
              // Update the user in the local Akita store
              this.update(user);

              // Update the user's Cognito identity
              this.updateCognitoAttributes(user)
                .subscribe(cognitoResult => {
                  console.log(cognitoResult);
                });

              observer.next(data.data);
              observer.complete();
            } else {
              observer.next(data.data);
              observer.complete();
            }
          });
        });
    });
  }

  addUser(user): Observable<any> {
    const functionName = 'addUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath + '/adminRegisterUser', myInit).then(registerUserResult => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(registerUserResult);

            if (registerUserResult.data.status !== false) {
              API.post(this.apiName, this.apiPath2 + '/addCognitoUser', myInit).then(addCognitoUserResult => {

                this.userStore.reset();
                this.cacheUsers().subscribe();

                observer.next(addCognitoUserResult.data);
                observer.complete();
              });

            } else {
              observer.next(registerUserResult.data);
              observer.complete();
            }
          });
        });
    });
  }

  deleteUser(user): Observable<any> {
    const functionName = 'deleteUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath + '/deleteUser', myInit).then(deleteUserResult => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(deleteUserResult);

            if (deleteUserResult.data.status !== false) {
              API.post(this.apiName, this.apiPath2 + '/deleteCognitoUser', myInit).then(deleteCognitoUserResult => {

                this.delete(user.userId);

                observer.next(deleteCognitoUserResult.data);
                observer.complete();
              });

            } else {
              observer.next(deleteUserResult.data);
              observer.complete();
            }
          });
        });
    });
  }

  deactivateUser(user): Observable<any> {
    const functionName = 'deactivateUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath + '/terminateUser', myInit).then(deactivateUserResult => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(deactivateUserResult);

            if (deactivateUserResult.data.status !== false) {
              API.post(this.apiName, this.apiPath2 + '/disableCognitoUser', myInit).then(disableCognitoUserResult => {

                this.setInactive(user.userId);

                observer.next(disableCognitoUserResult.data);
                observer.complete();
              });

            } else {
              observer.next(deactivateUserResult.data);
              observer.complete();
            }
          });
        });
    });
  }

  activateUser(user): Observable<any> {
    const functionName = 'activateUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            user: user
          };

          API.post(this.apiName, this.apiPath + '/reinstateUser', myInit).then(activateUserResult => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(activateUserResult);

            if (activateUserResult.data.status !== false) {
              API.post(this.apiName, this.apiPath2 + '/enableCognitoUser', myInit).then(enableCognitoUserResult => {

                this.setActive(user.userId);

                observer.next(enableCognitoUserResult.data);
                observer.complete();
              });

            } else {
              observer.next(activateUserResult.data);
              observer.complete();
            }
          });
        });
    });
  }
}
