import { UserHasStoreItemStore } from './user-has-store-item.store';
import { UserHasStoreItemQuery} from './user-has-store-item.query';
import { createStoreItemModel, UserHasStoreItemModel } from './user-has-store-item.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/user-has-store-item-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {createEntityUserAvatarModel, EntityUserModel} from '../../user/state/entity-user.model';
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

  update(recordId: number, status: string, cancelDescription: string) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: update ${recordId}`);
    this.userHasStoreItemStore.update((e) => e.recordId === recordId, {
      status: status,
      cancelDescription: cancelDescription
    });
  }

  getUserHasStoreItemRecords(): Observable<any> {
    const functionName = 'getUserHasStoreItemRecords';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getUserHasStoreItemRecords', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving user / store-item records  from API`);
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
          const managerId = userHasStoreItemRecords[i].managerUser.id;
          const managerFirstName = userHasStoreItemRecords[i].managerUser.firstName;
          const managerLastName = userHasStoreItemRecords[i].managerUser.lastName;
          const managerEmail = userHasStoreItemRecords[i].managerUser.email;
          const storeItemId = userHasStoreItemRecords[i].storeItemId;
          const storeItemName = userHasStoreItemRecords[i].storeItem.name;
          const storeItemDescription = userHasStoreItemRecords[i].storeItem.description;
          const storeItemCost = userHasStoreItemRecords[i].storeItem.cost;
          const status = userHasStoreItemRecords[i].status;
          const cancelDescription = userHasStoreItemRecords[i].cancelDescription;
          const userHasStoreItemModel = createStoreItemModel({recordId, userId, managerId, managerFirstName, managerLastName, managerEmail,
            storeItemId, storeItemName, storeItemDescription, storeItemCost, status, cancelDescription});
          userHasStoreItemRecordsArray.push(userHasStoreItemModel);
        }

        this.userHasStoreItemStore.set(userHasStoreItemRecordsArray);
      }));

    return cacheable(this.userHasStoreItemStore, request$);
  }

  newUserHasStoreItemRecord(managerId: number, storeItemId: number): Observable<any> {
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
            managerId: managerId,
            storeItemId: storeItemId
          };

          API.post(this.apiName, this.apiPath + '/newUserHasStoreItemRecord', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);

            if (data.data.status === true) {
              console.log(`${functionFullName}: status returned true. Updating entity store with new record`);
              const recordId = data.data.id;
              const userId = data.data.userId;
              const status = data.data.userHasStoreItemRecord.status;
              const userHasStoreItemModel = createStoreItemModel({recordId, userId, storeItemId, status});
              this.userHasStoreItemStore.add(userHasStoreItemModel);

              observer.next(data.data);
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

  getPendingBalance(): Observable<any> {
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
  }

}