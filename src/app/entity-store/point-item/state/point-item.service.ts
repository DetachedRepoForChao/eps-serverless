import { PointItemStore } from './point-item.store';
import { PointItemQuery} from './point-item.query';
import { createPointItemModel, PointItemModel } from './point-item.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/point-item-filter.model';
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
    const pointItemModel = createPointItemModel({itemId, name, description, amount, coreValues});
    this.pointItemStore.add(pointItemModel);
  }


  delete(itemId: number) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: delete ${itemId}`);
    this.pointItemStore.remove(e => e.itemId === itemId);
  }

  reset() {
    this.pointItemStore.reset();
  }

  update(itemId: number, name: string, description: string, amount: number, coreValues: string[]) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: update ${name}`);
    /** Update All */
    this.pointItemStore.update((e) => e.itemId === itemId, {
      name: name,
      description: description,
      amount: amount,
      coreValues: coreValues
    });
  }

  getPointItems(): Observable<any> {
    const functionName = 'getPointItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointItems', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving point items data from API`);
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

  awardPointsToEmployees(userPointObjectArray: any): Observable<any> {
    const functionName = 'awardPointsToEmployees';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            userPointObjectArray: userPointObjectArray
          };

          API.post(this.apiName, this.apiPath + '/giftPointsToEmployees', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  sendAwardPointsEmail(targetUser: any, sourceUser: any, pointItem: PointItemModel): Observable<any> {
    const functionName = 'sendAwardPointsEmail';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            targetUser: targetUser,
            sourceUser: sourceUser,
            pointItem: pointItem
          };

          API.post(this.apiName, this.apiPath2 + '/sendAwardPointsEmail', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  cachePointItems() {
    const functionName = 'cachePointItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getPointItems()
      .pipe(tap((pointItems: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(pointItems);

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
    const functionName = 'newPointItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            pointItem: pointItem
          };

          API.post(this.apiName, this.apiPath + '/newPointItem', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);

            if (data.data.status === true) {
              const itemId = data.data.id;
              const name = data.data.name;
              const description = data.data.description;
              const amount = data.data.amount;
              const coreValues: string[] = data.data.coreValues.split(';');
              for (let j = 0; j < coreValues.length; j++) {
                coreValues[j] = coreValues[j].trim();
              }

              this.add(itemId, name, description, amount, coreValues);
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

  modifyPointItem(pointItem): Observable<any> {
    const functionName = 'modifyPointItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

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
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);

            if (data.data.status === true) {
              const itemId = data.data.itemId;
              const name = data.data.name;
              const description = data.data.description;
              const amount = data.data.amount;
              const coreValues: string[] = data.data.coreValues.split(';');
              for (let j = 0; j < coreValues.length; j++) {
                coreValues[j] = coreValues[j].trim();
              }

              this.update(itemId, name, description, amount, coreValues);
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
    const functionName = 'deletePointItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

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
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);

            if (data.data.status === true) {
              this.delete(data.data.itemId);
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

