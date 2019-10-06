import { StoreItemStore } from './store-item.store';
import { StoreItemQuery} from './store-item.query';
import { createStoreItemModel, StoreItemModel } from './store-item.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/store-item-filter.model';
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
import {EntityUserQuery} from '../../user/state/entity-user.query';
import {EntityCurrentUserQuery} from '../../current-user/state/entity-current-user.query';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';

@Injectable({
  providedIn: 'root'
})
export class StoreItemService {

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

  constructor(private storeItemStore: StoreItemStore,
              private storeItemQuery: StoreItemQuery,
              private globals: Globals,
              private authService: AuthService,
              private userQuery: EntityUserQuery,
              private currentUserQuery: EntityCurrentUserQuery) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.storeItemStore.update({
      ui: {
        filter
      }
    });
  }


  add(itemId: number, name: string, description: string, cost: number, imagePath: string) {
    const storeItem = createStoreItemModel({itemId, name, description, cost, imagePath});
    this.storeItemStore.add(storeItem);
  }


  delete(id: ID) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: delete ${id}`);
    this.storeItemStore.remove(id);
  }

  reset() {
    this.storeItemStore.reset();
  }

  update(itemId: number, name: string, description: string, cost: number, imagePath: string) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: update ${name}`);
    /** Update All */
    this.storeItemStore.update((e) => e.itemId === itemId, {
      name: name,
      description: description,
      cost: cost,
      imagePath: imagePath
    });
  }

  getStoreItems(): Observable<any> {
    const functionName = 'getStoreItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getStoreItems', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving user store items data from API`);
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

  resolveStoreItemImage(storeItemData: any): Observable<any> {
    const functionName = 'resolveStoreItemImage';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // const key = storeItemData.avatarUrl.split('/')[1];
    const key = storeItemData.imagePath;

    return new Observable<any>(observer => {
      Storage.get(key, {
        level: 'public'
      })
        .then((result: string) => {
          console.log(result);
          const data = {
            itemId: storeItemData.id,
            name: storeItemData.name,
            description: storeItemData.description,
            cost: storeItemData.cost,
            imagePath: storeItemData.imagePath,
            imageResolvedUrl: result
          };

          observer.next(data);
          observer.complete();
        });
    });
  }

  cacheStoreItems() {
    const functionName = 'cacheStoreItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getStoreItems()
      .pipe(tap((storeItems: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(storeItems);

        const storeItemsArray: StoreItemModel[] = [];
        const observables: Observable<any>[] = [];

        for (let i = 0; i < storeItems.length; i++) {
          observables.push(this.resolveStoreItemImage(storeItems[i]));
        }

        forkJoin(observables)
          .subscribe((obsResult: any) => {
            for (let i = 0; i < obsResult.length; i++) {
              const itemId = obsResult[i].itemId;
              const name = obsResult[i].name;
              const description = obsResult[i].description;
              const cost = obsResult[i].cost;
              const imagePath = obsResult[i].imagePath;
              const imageResolvedUrl = obsResult[i].imageResolvedUrl;
              const storeItem = createStoreItemModel({itemId, name, description, cost, imagePath, imageResolvedUrl});
              storeItemsArray.push(storeItem);
            }

            this.storeItemStore.set(storeItemsArray);
          });
      }));

    return cacheable(this.storeItemStore, request$);
  }

  sendStoreItemPurchaseRequestEmail(managerUser: EntityUserModel, requestUser: EntityCurrentUserModel, storeItem: StoreItemModel): Observable<any> {
    const functionName = 'sendStoreItemPurchaseRequest';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            managerUser: managerUser,
            requestUser: requestUser,
            storeItem: storeItem
          };

          API.post(this.apiName, this.apiPath2 + '/sendRequestStoreItemEmail', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  submitStoreItemPurchaseRequest(storeItem: StoreItemModel): Observable<any> {
    const functionName = 'submitStoreItemPurchaseRequest';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const requestUser = this.currentUserQuery.getAll()[0]; // Retrieve current user info
    const managerUser = this.userQuery.getDepartmentManager(requestUser.department.Id)[0]; // Retrieve user's manager's info

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            requestUser: requestUser,
            managerUser: managerUser,
            storeItem: storeItem
          };

          API.post(this.apiName, this.apiPath2 + '/sendStoreItemPurchaseRequest', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }
}
