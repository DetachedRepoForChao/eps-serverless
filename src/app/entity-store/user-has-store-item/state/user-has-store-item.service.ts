import { UserHasStoreItemStore } from './user-has-store-item.store';
import { UserHasStoreItemQuery} from './user-has-store-item.query';
import { createStoreItemModel, UserHasStoreItemModel } from './user-has-store-item.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/user-has-store-item-filter.model';
import {action, guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {createEntityUserModel, EntityUserModel} from '../../user/state/entity-user.model';
import {store} from '@angular/core/src/render3';
import {PointItemModel} from '../../point-item/state/point-item.model';
import {StoreItemModel} from '../../store-item/state/store-item.model';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';
import {EntityCurrentUserService} from '../../current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../current-user/state/entity-current-user.query';
import {StoreItemQuery} from '../../store-item/state/store-item.query';

@Injectable({
  providedIn: 'root'
})
export class UserHasStoreItemService {

  componentName = 'store-item.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  apiPath2 = '/things';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private userHasStoreItemStore: UserHasStoreItemStore,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private storeItemQuery: StoreItemQuery,
              private globals: Globals,
              private authService: AuthService,
              private currentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.userHasStoreItemStore.update({
      ui: {
        filter
      }
    });
  }


  add(recordId: number, userId: number, storeItemId: number, status: string) {
    const userHasStoreItemModel = createStoreItemModel({recordId, userId, storeItemId, status});
    this.userHasStoreItemStore.add(userHasStoreItemModel);
  }


  delete(id: ID) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: delete ${id}`);
    this.userHasStoreItemStore.remove(id);
  }

  reset() {
    this.userHasStoreItemStore.reset();
  }

  update(recordId: number, status: string, cancelDescription: string, actionAt: any, updatedByUser: any) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const actionAtString = status + 'At';

    console.log(`${functionFullName}: update ${recordId}`);
    this.userHasStoreItemStore.update((e) => e.recordId === recordId, {
      status: status,
      cancelDescription: cancelDescription,
      [actionAtString]: actionAt,
      updatedByUser: updatedByUser
    });
  }

  getUserHasStoreItemRecords(): Observable<any> {
    const functionName = 'getUserHasStoreItemRecords';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          Auth.currentUserInfo()
            .then(userAttributes => {
              let apiCall = '/getUserHasStoreItemRecords';
              if (+userAttributes.attributes['custom:security_role_id'] === 3) {
                apiCall = '/getPurchaseRequestsAdmin';
              }
              const token = user.signInUserSession.idToken.jwtToken;
              const myInit = this.myInit;
              myInit.headers['Authorization'] = token;

              API.get(this.apiName, this.apiPath + apiCall, myInit).then(data => {
                console.log(`${functionFullName}: successfully retrieved data from API`);
                console.log(data);
                if (data.data.status !== false) {
                  observer.next(data.data.purchaseRequests);
                  observer.complete();
                } else {
                  observer.error(data.data.status);
                  observer.complete();
                }
              })
                .catch(err => {
                  console.log(`${functionFullName}: error retrieving user / store-item records  from API`, err);
                  observer.error(err);
                  observer.complete();
                });
            })
            .catch(err => {
              console.log(`${functionFullName}: error getting current user info from auth service`, err);
              observer.error(err);
              observer.complete();
            });
        })
        .catch(err => {
          console.log(`${functionFullName}: error getting current authenticated user from auth service`, err);
          observer.error(err);
          observer.complete();
        });
    });
  }

  cacheUserHasStoreItemRecords() {
    const functionName = 'cacheUserHasStoreItemRecords';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getUserHasStoreItemRecords()
      .pipe(tap((userHasStoreItemRecords: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(userHasStoreItemRecords);

        const userHasStoreItemRecordsArray: UserHasStoreItemModel[] = [];

        for (let i = 0; i < userHasStoreItemRecords.length; i++) {
          const recordId = userHasStoreItemRecords[i].id;
          const userId = userHasStoreItemRecords[i].userId;
          const userUsername = userHasStoreItemRecords[i].requestUser.username;
          const userFirstName = userHasStoreItemRecords[i].requestUser.firstName;
          const userLastName = userHasStoreItemRecords[i].requestUser.lastName;
          const userEmail = userHasStoreItemRecords[i].requestUser.email;
          // const managerId = userHasStoreItemRecords[i].managerUser.id;
/*          const managerUsername = userHasStoreItemRecords[i].managerUser.username;
          const managerFirstName = userHasStoreItemRecords[i].managerUser.firstName;
          const managerLastName = userHasStoreItemRecords[i].managerUser.lastName;*/
          // const managerEmail = userHasStoreItemRecords[i].managerUser.email;
          const storeItemId = userHasStoreItemRecords[i].storeItemId;
          const storeItemName = userHasStoreItemRecords[i].storeItem.name;
          const storeItemDescription = userHasStoreItemRecords[i].storeItem.description;
          const storeItemCost = userHasStoreItemRecords[i].storeItem.cost;
          const status = userHasStoreItemRecords[i].status;
          const cancelDescription = userHasStoreItemRecords[i].cancelDescription;
          const cancelledAt = userHasStoreItemRecords[i].cancelledAt;
          const readyForPickupAt = userHasStoreItemRecords[i].readyForPickupAt;
          const pickedUpAt = userHasStoreItemRecords[i].pickedUpAt;
          const createdAt = userHasStoreItemRecords[i].createdAt;
          const updatedAt = userHasStoreItemRecords[i].updatedAt;
          const updatedByUser = (userHasStoreItemRecords[i].updatedByUser) ? userHasStoreItemRecords[i].updatedByUser : null;
          const userHasStoreItemModel = createStoreItemModel({recordId, userId, userUsername, userFirstName, userLastName, userEmail,
            storeItemId, storeItemName, storeItemDescription,
            storeItemCost, status, cancelDescription, cancelledAt, readyForPickupAt, pickedUpAt, createdAt, updatedAt});
          userHasStoreItemRecordsArray.push(userHasStoreItemModel);
        }

        this.userHasStoreItemStore.set(userHasStoreItemRecordsArray);
      }));

    return cacheable(this.userHasStoreItemStore, request$);
  }

  newUserHasStoreItemRecord(storeItemId: number): Observable<any> {
    const functionName = 'newUserHasStoreItemRecord';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            storeItemId: storeItemId
          };

          API.post(this.apiName, this.apiPath + '/newUserHasStoreItemRecord', myInit).then(response => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(response);

            if (response.data.status !== false) {
              console.log(`${functionFullName}: status returned true. Updating entity store with new record`);
              const recordId = response.data.purchaseRequest.id;
              const userId = response.data.purchaseRequest.userId;
              const userUsername = response.data.purchaseRequest.requestUser.username;
              const userFirstName = response.data.purchaseRequest.requestUser.firstName;
              const userLastName = response.data.purchaseRequest.requestUser.lastName;
              const userEmail = response.data.purchaseRequest.requestUser.email;
              // const managerId = response.data.userHasStoreItemRecord.managerUser.id;
              // const managerUsername = response.data.purchaseRequest.managerUser.username;
              // const managerFirstName = response.data.purchaseRequest.managerUser.firstName;
              // const managerLastName = response.data.purchaseRequest.managerUser.lastName;
              // const managerEmail = response.data.purchaseRequest.managerUser.email;
              // const storeItemId = response.data.userHasStoreItemRecord.storeItemId;
              const storeItemName = response.data.purchaseRequest.storeItem.name;
              const storeItemDescription = response.data.purchaseRequest.storeItem.description;
              const storeItemCost = response.data.purchaseRequest.storeItem.cost;
              const status = response.data.purchaseRequest.status;
              const cancelDescription = response.data.purchaseRequest.cancelDescription;
              const cancelledAt = response.data.purchaseRequest.cancelledAt;
              const readyForPickupAt = response.data.purchaseRequest.readyForPickupAt;
              const pickedUpAt = response.data.purchaseRequest.pickedUpAt;
              const createdAt = response.data.purchaseRequest.createdAt;
              const updatedAt = response.data.purchaseRequest.updatedAt;
              const userHasStoreItemModel = createStoreItemModel({recordId, userId, userUsername, userFirstName, userLastName, userEmail,
                storeItemId, storeItemName,
                storeItemDescription, storeItemCost, status, cancelDescription, cancelledAt, readyForPickupAt, pickedUpAt, createdAt,
                updatedAt});

              // Add new record to local store
              this.userHasStoreItemStore.add(userHasStoreItemModel);

              // Update current user's points with new amount within the local store
              this.currentUserService.updatePoints(response.data.newPointTotal);

              observer.next(response.data);
              observer.complete();
            } else {
              console.log(`${functionFullName}: status did not return true`);
              observer.next(false);
              observer.complete();
            }
          });
        });
    });
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

          if (storeItem) {
            sum += storeItem.cost;
          }
        }

        observer.next(sum);
        observer.complete();
      });
    });
  }*/

  setStoreItemRequestReadyForPickup(request: UserHasStoreItemModel): Observable<any> {
    const functionName = 'setStoreItemRequestReadyForPickup';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            request: request
          };

          API.post(this.apiName, this.apiPath + '/setStoreItemRequestReadyForPickup', myInit).then(response => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(response);

            if (response.data.status !== false) {
              console.log(`${functionFullName}: status returned true. Updating record in entity store`);
              const recordId = response.data.updatedRecord.recordId;
              const status = response.data.updatedRecord.status;
              const actionAt = response.data.updatedRecord.updatedAt;
              const updatedByUser = response.data.updatedByUser;
              const cancelDescription = null;
              this.update(recordId, status, cancelDescription, actionAt, updatedByUser);

              observer.next(response.data);
              observer.complete();
            } else {
              console.log(`${functionFullName}: status did not return true`);
              observer.next(false);
              observer.complete();
            }
          });
        });
    });
  }

  setStoreItemRequestsReadyForPickup(requests: UserHasStoreItemModel[]): Observable<any> {
    const functionName = 'setStoreItemRequestsReadyForPickup';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            requests: requests
          };

          API.post(this.apiName, this.apiPath + '/setStoreItemRequestsReadyForPickup', myInit).then(response => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(response);

            if (response.data.status !== false) {
              console.log(`${functionFullName}: status returned true. Updating records in entity store`);
              console.log('results');
              console.log(response.data.results);

              for (const result of response.data.results) {
                console.log('result');
                console.log(result);

                const recordId = result.updatedRecord.recordId;
                const status = result.updatedRecord.status;
                const actionAt = result.updatedRecord.updatedAt;
                const updatedByUser = response.data.updatedByUser;
                const cancelDescription = null;
                this.update(recordId, status, cancelDescription, actionAt, updatedByUser);
                console.log(`record id ${recordId} updated with status ${status} for user ${result.updatedRecord.userUsername}`);

                if (result.status !== false) {
                  console.log(`${result.updatedRecord.userUsername}'s points were adjusted to ${result.newPointTotal}`);

                } else {
                  console.log(`Ran into an error trying to adjust ${result.updatedRecord.userUsername}'s points`);
                }
              }

              observer.next(response.data);
              observer.complete();
            } else {
              console.log(`${functionFullName}: status did not return true`);
              observer.next(false);
              observer.complete();
            }
          });
        });
    });
  }


  setStoreItemRequestPickedUp(request: UserHasStoreItemModel): Observable<any> {
    const functionName = 'setStoreItemRequestPickedUp';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            request: request
          };

          API.post(this.apiName, this.apiPath + '/setStoreItemRequestPickedUp', myInit).then(response => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(response);

            if (response.data.status !== false) {
              console.log(`${functionFullName}: status returned true. Updating record in entity store`);
              const recordId = response.data.updatedRecord.recordId;
              const status = response.data.updatedRecord.status;
              const actionAt = response.data.updatedRecord.updatedAt;
              const updatedByUser = response.data.updatedByUser;
              const cancelDescription = null;
              this.update(recordId, status, cancelDescription, actionAt, updatedByUser);

              observer.next(response.data);
              observer.complete();
            } else {
              console.log(`${functionFullName}: status did not return true`);
              observer.next(false);
              observer.complete();
            }
          });
        });
    });
  }

  setStoreItemRequestsPickedUp(requests: UserHasStoreItemModel[]): Observable<any> {
    const functionName = 'setStoreItemRequestsPickedUp';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            requests: requests
          };

          API.post(this.apiName, this.apiPath + '/setStoreItemRequestsPickedUp', myInit).then(response => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(response);

            if (response.data.status !== false) {
              console.log(`${functionFullName}: status returned true. Updating records in entity store`);
              for (const updatedRecord of response.data.updatedRecords) {
                const recordId = updatedRecord.recordId;
                const status = updatedRecord.status;
                const actionAt = updatedRecord.updatedAt;
                const updatedByUser = response.data.updatedByUser;
                const cancelDescription = null;
                this.update(recordId, status, cancelDescription, actionAt, updatedByUser);
              }

              // Notify user that items are ready for pickup



              observer.next(response.data);
              observer.complete();
            } else {
              console.log(`${functionFullName}: status did not return true`);
              observer.next(false);
              observer.complete();
            }
          });
        });
    });
  }

  sendReadyForPickupNotice(purchaseRequestManager: any, requestUser: any, storeItems: any ): Observable<any> {
    const functionName = 'sendReadyForPickupNotice';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            purchaseRequestManager: purchaseRequestManager,
            requestUser: requestUser,
            storeItems: storeItems
          };

          API.post(this.apiName, this.apiPath2 + '/sendReadyForPickupNotice', myInit).then(response => {
            console.log(response);


            observer.next();
            observer.complete();
          });
        });

    });
  }

  processRequests(requests: any[]): Observable<any> {
    const functionName = 'processRequests';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      const observables: Observable<any>[] = [];
      const readyForPickupArray = [];
      const pickedUpArray = [];

      for (const request of requests) {
        switch (request.action) {
          case 'readyForPickup':
            readyForPickupArray.push(request.item);
            break;
          case 'pickedUp':
            pickedUpArray.push(request.item);
            break;
        }
      }

      if (readyForPickupArray.length > 0) {
        observables.push(this.setStoreItemRequestsReadyForPickup(readyForPickupArray));
      }

      if (pickedUpArray.length > 0) {
        observables.push(this.setStoreItemRequestsPickedUp(pickedUpArray));
      }

      forkJoin(observables).subscribe((result) => {
        console.log('Observables result');
        console.log(result);

        observer.next(result);
        observer.complete();
      });
    });
  }

}
