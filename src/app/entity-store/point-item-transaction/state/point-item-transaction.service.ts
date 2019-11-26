import { PointItemTransactionStore } from './point-item-transaction.store';
import { PointItemTransactionQuery} from './point-item-transaction.query';
import { createPointItemTransactionModel, PointItemTransactionModel } from './point-item-transaction.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/point-item-transaction-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PointItemTransactionService {

  componentName = 'point-item-transaction.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private pointItemTransactionStore: PointItemTransactionStore,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private authService: AuthService) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.pointItemTransactionStore.update({
      ui: {
        filter
      }
    });
  }


  add(transactionId: number, type: string, amount: number, sourceUserId: number, targetUserId: number, pointItemId: number,
      description: string, createdAt: any) {
    const pointItemTransaction = createPointItemTransactionModel({transactionId, type, amount, sourceUserId, targetUserId, pointItemId,
      description, createdAt});
    this.pointItemTransactionStore.add(pointItemTransaction);
  }


  delete(id: ID) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: delete ${id}`);
    this.pointItemTransactionStore.remove(id);
  }

  update(pointItemTransaction) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(pointItemTransaction);

    const pointItemTransactionUpdate = {};
    const keys = Object.keys(pointItemTransaction);

    for (let i = 0; i < keys.length; i++) {
      pointItemTransactionUpdate[keys[i]] = pointItemTransaction[keys[i]];
    }

    console.log(pointItemTransactionUpdate);

    this.pointItemTransactionStore.update((e) => e.transactionId === pointItemTransaction.transactionId, pointItemTransactionUpdate);
  }

  getUserCoreValues(userId: number): Observable<any> {
    const functionName = 'getUserCoreValues';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            userId: userId
          };

          API.post(this.apiName, this.apiPath + '/getUserCoreValues', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data.coreValues);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving features data from API`);
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

  getCurrentUserPointItemTransactions(): Observable<any> {
    const functionName = 'getCurrentUserPointItemTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getCurrentUserPointTransactions', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data.pointTransactions);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving features data from API`);
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

  getUserPointItemTransactions(userId: number): Observable<any> {
    const functionName = 'getUserPointItemTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            userId: userId
          };

          API.post(this.apiName, this.apiPath + '/getUserPointTransactions', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data.pointTransactions);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving features data from API`);
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

  cacheUserPointItemTransactions(userId: number) {
    const functionName = 'cacheUserPointItemTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: User Id ${userId}`);
    // this.pointItemTransactionStore.setLoading(true);
    return new Observable<any>(observer => {
      // Check if point transactions for this user have already been cached
      const transactions = this.pointItemTransactionQuery.getAll({
        filterBy: e => e.targetUserId === userId
      });
      if (transactions.length > 0) {
        // Point transactions for this user have already been retrieved
        // console.log(transactions);
        console.log(`${functionFullName}: Point transactions for user ${userId} have already been retrieved`);
        observer.next(false);
        observer.complete();
        // this.pointItemTransactionStore.setLoading(false);
      } else {
        const request$ = this.getUserPointItemTransactions(userId)
          .pipe(tap((pointItemTransactions: any) => {
            console.log(`${functionFullName}: caching for User Id ${userId}:`);
            // console.log(pointItemTransactions);

            const pointItemTransactionsArray: PointItemTransactionModel[] = [];

            for (let i = 0; i < pointItemTransactions.length; i++) {
              const transactionId = pointItemTransactions[i].id;
              // Make sure we're not adding duplicates
              if (this.pointItemTransactionQuery.getAll({filterBy: e => e.transactionId === transactionId}).length > 0) {
                // Duplicate. Ignore this one.
                // console.log('Duplicate...');
                // console.log(this.pointItemTransactionQuery.getAll({filterBy: e => e.transactionId === transactionId}));
              } else {
                const type = pointItemTransactions[i].type;
                const amount = pointItemTransactions[i].amount;
                const sourceUserId = pointItemTransactions[i].sourceUserId;
                const targetUserId = pointItemTransactions[i].targetUserId;
                const pointItemId = pointItemTransactions[i].pointItemId;
                const description = pointItemTransactions[i].description;

                const coreValues: string[] = pointItemTransactions[i].pointItem.coreValues.split(';');
                for (let j = 0; j < coreValues.length; j++) {
                  coreValues[j] = coreValues[j].trim();
                }

                const createdAt = pointItemTransactions[i].createdAt;

                const pointItemTransactionModel = createPointItemTransactionModel({transactionId, type, amount, sourceUserId, targetUserId, pointItemId,
                  description, coreValues, createdAt});
                // console.log('pointItemTransactionModel');
                // console.log(pointItemTransactionModel);
                pointItemTransactionsArray.push(pointItemTransactionModel);
                // console.log('pointItemTransactionsArray');
                // console.log(pointItemTransactionsArray);
              }
            }

            if (this.pointItemTransactionQuery.getAll().length > 0) {
              for (const transaction of this.pointItemTransactionQuery.getAll()) {
                pointItemTransactionsArray.push(transaction);
              }
            }

            // console.log('caching transactions: ');
            // console.log(pointItemTransactionsArray);
            this.pointItemTransactionStore.set(pointItemTransactionsArray);
          }));

        observer.next(request$);
        observer.complete();
        // this.pointItemTransactionStore.setLoading(false);
      }
    });
  }

  /*cacheCurrentUserPointItemTransactions() {
    const functionName = 'cacheCurrentUserPointItemTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      // Check if point transactions for this user have already been cached
      this.pointItemTransactionQuery.selectAll({
        filterBy: e => e.targetUserId === userId
      }).subscribe(transactions => {
        if (transactions.length > 0) {
          // Point transactions for this user have already been retrieved
          // console.log(transactions);
          // console.log(`${functionFullName}: Point transactions for user ${userId} have already been retrieved`);
          observer.next(false);
          observer.complete();
        } else {
          const request$ = this.getCurrentUserPointItemTransactions()
            .pipe(tap((pointItemTransactions: any) => {
              console.log(`${functionFullName}: caching:`);
              console.log(pointItemTransactions);

              const pointItemTransactionsArray: PointItemTransactionModel[] = [];

              for (let i = 0; i < pointItemTransactions.length; i++) {
                const transactionId = pointItemTransactions[i].id;
                const type = pointItemTransactions[i].type;
                const amount = pointItemTransactions[i].amount;
                const sourceUserId = pointItemTransactions[i].sourceUserId;
                const targetUserId = pointItemTransactions[i].targetUserId;
                const pointItemId = pointItemTransactions[i].pointItemId;
                const description = pointItemTransactions[i].description;
                const createdAt = pointItemTransactions[i].createdAt;

                const pointItemTransactionModel = createPointItemTransactionModel({transactionId, type, amount, sourceUserId, targetUserId, pointItemId,
                  description, createdAt});
                pointItemTransactionsArray.push(pointItemTransactionModel);
                // this.pointItemTransactionStore.add(pointItemTransactionModel);
              }

              this.pointItemTransactionStore.set(pointItemTransactionsArray);
            }));

          observer.next(request$);
          observer.complete();
        }
      });
    });
  }*/
  /*
  cacheCurrentUserPointItemTransactions() {
    const functionName = 'cacheCurrentUserPointItemTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getCurrentUserPointItemTransactions()
      .pipe(tap((pointItemTransactions: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(pointItemTransactions);

        const pointItemTransactionsArray: PointItemTransactionModel[] = [];

        for (let i = 0; i < pointItemTransactions.length; i++) {
          const transactionId = pointItemTransactions[i].id;
          const type = pointItemTransactions[i].type;
          const amount = pointItemTransactions[i].amount;
          const sourceUserId = pointItemTransactions[i].sourceUserId;
          const targetUserId = pointItemTransactions[i].targetUserId;
          const pointItemId = pointItemTransactions[i].pointItemId;
          const description = pointItemTransactions[i].description;
          const createdAt = pointItemTransactions[i].createdAt;

          const pointItemTransactionModel = createPointItemTransactionModel({transactionId, type, amount, sourceUserId, targetUserId,
            pointItemId, description, createdAt});
          pointItemTransactionsArray.push(pointItemTransactionModel);
        }

        this.pointItemTransactionStore.set(pointItemTransactionsArray);
      }));

    return cacheable(this.pointItemTransactionStore, request$);
  }*/
}
