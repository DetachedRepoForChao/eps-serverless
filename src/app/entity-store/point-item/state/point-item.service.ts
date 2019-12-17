import { PointItemStore } from './point-item.store';
import { PointItemQuery} from './point-item.query';
import { createPointItemModel, PointItemModel } from './point-item.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/point-item-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {createEntityUserModel, EntityUserModel} from '../../user/state/entity-user.model';
import {store} from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})
export class PointItemService {

  componentName = 'point-item.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  apiPath2 = '/things';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private pointItemStore: PointItemStore,
              private pointItemQuery: PointItemQuery,
              private globals: Globals,
              private authService: AuthService) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.pointItemStore.update({
      ui: {
        filter
      }
    });
  }


  add(itemId: number, name: string, description: string, amount: number, coreValues: string[]) {
    // const functionName = 'add';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    const pointItemModel = createPointItemModel({itemId, name, description, amount, coreValues});
    // console.log(pointItemModel);
    this.pointItemStore.add(pointItemModel);
  }


  delete(itemId: number) {
    // const functionName = 'delete';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: delete ${itemId}`);
    this.pointItemStore.remove(e => e.itemId === itemId);
  }

  reset() {
    this.pointItemStore.reset();
  }


  update(pointItem) {
    // const functionName = 'update';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(pointItem);
    // console.log(`${functionFullName}: update ${user.firstName} ${user.lastName}`);

    const pointItemUpdate = {};
    const keys = Object.keys(pointItem);

    for (let i = 0; i < keys.length; i++) {
      pointItemUpdate[keys[i]] = pointItem[keys[i]];
    }

    // console.log(pointItemUpdate);

    this.pointItemStore.update((e) => e.itemId === pointItem.itemId, pointItemUpdate);
  }

  getPointItems(): Observable<any> {
    // const functionName = 'getPointItems';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointItems', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              // console.log(`${functionFullName}: error retrieving point items data from API`);
              // console.log(err);
              observer.next(err);
              observer.complete();
            });
        })
        .catch(err => {
          // console.log(`${functionFullName}: error getting current authenticated user from auth service`);
          // console.log(err);
          observer.next(err);
          observer.complete();
        });
    });
  }

  awardPointsToEmployees(userPointObjectArray: any): Observable<any> {
    // const functionName = 'awardPointsToEmployees';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            userPointObjectArray: userPointObjectArray
          };

          API.post(this.apiName, this.apiPath + '/giftPointsToEmployees', myInit)
            .then(response => {
            // console.log(`${functionFullName}: API call successfull`);
            // console.log(response);
            if (response.data.status !== false) {
              observer.next(response.data);
              observer.complete();
            } else {
              // console.log(`${functionFullName}: API call returned with an error`, response.data);
              observer.error(response.data);
              observer.complete();
            }
          })
            .catch(err => {
              // console.log(`${functionFullName}: API call error`, err);
              observer.error(err);
              observer.complete();
            });
        })
        .catch(err => {
          // console.log(`${functionFullName}: Auth error`, err);
          observer.error(err);
          observer.complete();
        });
    });
  }

  sendAwardPointsNotice(targetUser: any, sourceUser: any, pointItem: PointItemModel, comment: string): Observable<any> {
    // const functionName = 'sendAwardPointsNotice';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            targetUser: targetUser,
            sourceUser: sourceUser,
            pointItem: pointItem,
            comment: comment,
          };

          API.post(this.apiName, this.apiPath2 + '/sendAwardPointsNotice', myInit).then(data => {
            // console.log(`${functionFullName}: data retrieved from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  cachePointItems() {
    // const functionName = 'cachePointItems';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    const request$ = this.getPointItems()
      .pipe(tap((pointItems: any) => {
        // console.log(`${functionFullName}: caching:`);
        // console.log(pointItems);

        const pointItemsArray: PointItemModel[] = [];

        for (let i = 0; i < pointItems.length; i++) {
          // We need to split the core values into an array of strings
          const coreValues: string[] = pointItems[i].coreValues.split(';');
          for (let j = 0; j < coreValues.length; j++) {
            coreValues[j] = coreValues[j].trim();
          }

          const itemId = pointItems[i].id;
          const name = pointItems[i].name;
          const description = pointItems[i].description;
          const amount = pointItems[i].amount;
          const pointItemModel = createPointItemModel({itemId, name, description, amount, coreValues});
          pointItemsArray.push(pointItemModel);
        }

        this.pointItemStore.set(pointItemsArray);
      }));

    return cacheable(this.pointItemStore, request$);
  }

  newPointItem(pointItem): Observable<any> {
    // const functionName = 'newPointItem';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            pointItem: pointItem
          };

          API.post(this.apiName, this.apiPath + '/newPointItem', myInit).then(response => {
            // console.log(`${functionFullName}: data retrieved from API`);
            // console.log(response);

            if (response.data.status !== false) {
/*              const itemId = response.data.id;
              const name = response.data.name;
              const description = response.data.description;
              const amount = response.data.amount;
              const coreValues: string[] = response.data.coreValues.split(';');
              for (let j = 0; j < coreValues.length; j++) {
                coreValues[j] = coreValues[j].trim();
              }
              const createdByUsername = response.data.createdByUsername;
              const updatedByUsername = response.data.updatedByUsername;*/

              // this.add(itemId, name, description, amount, coreValues, createdByUsername, updatedByUsername);

              this.pointItemStore.reset();
              this.cachePointItems()
                .pipe(take(1))
                .subscribe();

              observer.next(response.data);
              observer.complete();
            } else {
              observer.error(response.data);
              observer.complete();
            }
          });
        });
    });
  }

  modifyPointItem(pointItem): Observable<any> {
    // const functionName = 'modifyPointItem';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            pointItem: pointItem
          };

          API.post(this.apiName, this.apiPath + '/modifyPointItem', myInit).then(data => {
            // console.log(`${functionFullName}: data retrieved from API`);
            // console.log(data);

            if (data.data.status !== false) {

              this.update(pointItem);

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

  deletePointItem(pointItem): Observable<any> {
    // const functionName = 'deletePointItem';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            pointItem: pointItem
          };

          API.post(this.apiName, this.apiPath + '/deletePointItem', myInit).then(data => {
            // console.log(`${functionFullName}: data retrieved from API`);
            // console.log(data);

            if (data.data.status !== false) {
              this.delete(pointItem.itemId);
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
}

