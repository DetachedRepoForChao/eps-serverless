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

  retrievedUserIds: number[] = [];
  retrievedManagerIds: number[] = [];
  numBatchRetrieved: number = null;
  public initialBatchRetrieved = false;

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

          API.get(this.apiName, this.apiPath + '/getCurrentUserPointTransactions', myInit).then(response => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(response);
            observer.next(response.data.pointTransactions);
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

          API.post(this.apiName, this.apiPath + '/getUserPointTransactions', myInit).then(response => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(response);
            observer.next(response.data.pointTransactions);
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


  getPointItemTransactionsRange(startIndex: number, numberRecords: number): Observable<any> {
    const functionName = 'getPointItemTransactionsRange';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            startIndex: startIndex,
            numberRecords: numberRecords
          };

          API.post(this.apiName, this.apiPath + '/getPointTransactionRange', myInit).then(response => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(response);
            observer.next(response.data);
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


  getManagerPointItemTransactions(userId: number): Observable<any> {
    const functionName = 'getManagerPointItemTransactions';
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

          API.post(this.apiName, this.apiPath + '/getManagerPointTransactions', myInit).then(response => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(response);
            observer.next(response.data.pointTransactions);
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
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const username = currentUser.username;

          // Check if point transactions for this user have already been cached
          if (this.retrievedUserIds.find(x => x === userId)) {
            // Point transactions for this user have already been retrieved
            console.log(`${functionFullName}: Point transactions for user ${userId} have already been retrieved`);
            observer.next(false);
            observer.complete();
          } else {
            const request$ = this.getUserPointItemTransactions(userId)
              .pipe(tap((pointItemTransactions: any) => {
                console.log(`${functionFullName}: caching for User Id ${userId}:`);

                const pointItemTransactionsArray: PointItemTransactionModel[] = [];

                for (const pointItemTransaction of pointItemTransactions) {
                  const transactionId = pointItemTransaction.id;
                  // Make sure we're not adding duplicates
                  if (this.pointItemTransactionQuery.getAll({filterBy: e => e.transactionId === transactionId}).length > 0) {
                    // Duplicate. Ignore this one.
                    console.log(`${functionFullName}: transaction is a duplicate: ${transactionId}`);
                  } else {
                    console.log(`${functionFullName}: adding transaction: ${transactionId}`);
                    const type = pointItemTransaction.type;
                    const amount = pointItemTransaction.amount;
                    const sourceUserId = pointItemTransaction.sourceUserId;
                    const targetUserId = pointItemTransaction.targetUserId;
                    const pointItemId = pointItemTransaction.pointItemId;
                    const description = pointItemTransaction.description;

                    const coreValues: string[] = pointItemTransaction.pointItem.coreValues.split(';');
                    for (let j = 0; j < coreValues.length; j++) {
                      coreValues[j] = coreValues[j].trim();
                    }

                    const createdAt = pointItemTransaction.createdAt;
                    const likes = pointItemTransaction.likeInfos;
                    const likedByCurrentUser = (pointItemTransaction.likeInfos && pointItemTransaction.likeInfos.username === username) ? true : false;

                    const pointItemTransactionModel = createPointItemTransactionModel({transactionId, type, amount, sourceUserId,
                      targetUserId, pointItemId, description, coreValues, createdAt, likes, likedByCurrentUser});
                    pointItemTransactionsArray.push(pointItemTransactionModel);
                  }
                }

                if (this.pointItemTransactionQuery.getAll().length > 0) {
                  console.log(`${functionFullName}: Adding transactions`);
                  console.log(this.pointItemTransactionQuery.getAll());
                  console.log(`${functionFullName}: to`);
                  console.log(pointItemTransactionsArray);
                  for (const transaction of this.pointItemTransactionQuery.getAll()) {
                    pointItemTransactionsArray.push(transaction);
                  }
                } else {
                  console.log(`${functionFullName}: Setting transactions`);
                  console.log(pointItemTransactionsArray);
                }

                this.pointItemTransactionStore.set(pointItemTransactionsArray);
              }));

            this.retrievedUserIds.push(userId);
            observer.next(request$);
            observer.complete();
          }
        });
    });
  }

  cacheManagerPointItemTransactions(managerId: number) {
    const functionName = 'cacheManagerPointItemTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: Manager Id ${managerId}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const username = currentUser.username;

          // Check if point transactions for this manager have already been cached.
          if (this.retrievedManagerIds.find(x => x === managerId)) {
            // Point transactions for this user have already been retrieved
            console.log(`${functionFullName}: Point transactions for manager ${managerId} have already been retrieved`);
            observer.next(false);
            observer.complete();
          } else {
            const request$ = this.getManagerPointItemTransactions(managerId)
              .pipe(tap((pointItemTransactions: any) => {
                console.log(`${functionFullName}: caching for Manager Id ${managerId}:`);

                const pointItemTransactionsArray: PointItemTransactionModel[] = [];

                for (const pointItemTransaction of pointItemTransactions) {
                  const transactionId = pointItemTransaction.id;
                  // Make sure we're not adding duplicates
                  if (this.pointItemTransactionQuery.getAll({filterBy: e => e.transactionId === transactionId}).length > 0) {
                    // Duplicate. Ignore this one.
                    console.log(`${functionFullName}: transaction is a duplicate: ${transactionId}`);
                  } else {
                    console.log(`${functionFullName}: adding transaction: ${transactionId}`);
                    const type = pointItemTransaction.type;
                    const amount = pointItemTransaction.amount;
                    const sourceUserId = pointItemTransaction.sourceUserId;
                    const targetUserId = pointItemTransaction.targetUserId;
                    const pointItemId = pointItemTransaction.pointItemId;
                    const description = pointItemTransaction.description;

                    const coreValues: string[] = pointItemTransaction.pointItem.coreValues.split(';');
                    for (let j = 0; j < coreValues.length; j++) {
                      coreValues[j] = coreValues[j].trim();
                    }

                    const createdAt = pointItemTransaction.createdAt;
                    const likes = pointItemTransaction.likeInfos;
                    const likedByCurrentUser = (pointItemTransaction.likeInfos && pointItemTransaction.likeInfos.username === username) ? true : false;

                    const pointItemTransactionModel = createPointItemTransactionModel({transactionId, type, amount, sourceUserId,
                      targetUserId, pointItemId, description, coreValues, createdAt, likes, likedByCurrentUser});
                    pointItemTransactionsArray.push(pointItemTransactionModel);
                  }
                }

                if (this.pointItemTransactionQuery.getAll().length > 0) {
                  console.log(`${functionFullName}: Adding transactions`);
                  console.log(this.pointItemTransactionQuery.getAll());
                  console.log(`${functionFullName}: to`);
                  console.log(pointItemTransactionsArray);
                  for (const transaction of this.pointItemTransactionQuery.getAll()) {
                    pointItemTransactionsArray.push(transaction);
                  }
                } else {
                  console.log(`${functionFullName}: Setting transactions`);
                  console.log(pointItemTransactionsArray);
                }

                this.pointItemTransactionStore.set(pointItemTransactionsArray);
              }));

            this.retrievedManagerIds.push(managerId);
            observer.next(request$);
            observer.complete();
          }
        });
    });
  }

  cachePointItemTransactionsBatch() {
    const functionName = 'cachePointItemTransactionsBatch';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const numberRecords = 10;
    let startIndex;
    if (!this.numBatchRetrieved) {
      console.log(`${functionFullName}: Retrieving first transaction batch`);
      startIndex = 0;
    } else {
      startIndex = (this.numBatchRetrieved + 1) * 10;
    }

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const username = currentUser.username;

          // Check if point transactions for this user have already been cached
          if (this.numBatchRetrieved && (this.numBatchRetrieved * 10) >= startIndex) {
            // Point transactions for this batch has already been retrieved
            console.log(`${functionFullName}: Point transactions for range [${startIndex} - ${startIndex + numberRecords}] have already been retrieved`);
            observer.next(false);
            observer.complete();
          } else {
            const request$ = this.getPointItemTransactionsRange(startIndex, numberRecords)
              .pipe(tap((pointItemTransactions: any) => {
                console.log(`${functionFullName}: caching for range [${startIndex} - ${startIndex + numberRecords}]:`);
                console.log(pointItemTransactions);

                const pointItemTransactionsArray: PointItemTransactionModel[] = [];

                for (const pointItemTransaction of pointItemTransactions) {
                  console.log(pointItemTransaction);
                  const transactionId = pointItemTransaction.id;
                  // Make sure we're not adding duplicates
                  if (this.pointItemTransactionQuery.getAll({filterBy: e => e.transactionId === transactionId}).length > 0) {
                    // Duplicate. Ignore this one.
                    console.log(`${functionFullName}: transaction is a duplicate: ${transactionId}`);
                  } else {
                    console.log(`${functionFullName}: adding transaction: ${transactionId}`);
                    const type = pointItemTransaction.type;
                    const amount = pointItemTransaction.amount;
                    const sourceUserId = pointItemTransaction.sourceUserId;
                    const targetUserId = pointItemTransaction.targetUserId;
                    const pointItemId = pointItemTransaction.pointItemId;
                    const description = pointItemTransaction.description;

                    let coreValues: string[] = [];
                    if (pointItemTransaction.pointItem && pointItemTransaction.pointItem.coreValues) {
                      coreValues = pointItemTransaction.pointItem.coreValues.split(';');
                      for (let j = 0; j < coreValues.length; j++) {
                        coreValues[j] = coreValues[j].trim();
                      }
                    }

                    const createdAt = pointItemTransaction.createdAt;
                    const likes = pointItemTransaction.likeInfos;
                    const likedByCurrentUser = (pointItemTransaction.likeInfos && pointItemTransaction.likeInfos.username === username) ? true : false;

                    const pointItemTransactionModel = createPointItemTransactionModel({transactionId, type, amount, sourceUserId, targetUserId,
                      pointItemId, description, coreValues, createdAt, likes, likedByCurrentUser});
                    pointItemTransactionsArray.push(pointItemTransactionModel);
                  }
                }

                if (this.pointItemTransactionQuery.getAll().length > 0) {
                  console.log(`${functionFullName}: Adding transactions`);
                  console.log(this.pointItemTransactionQuery.getAll());
                  console.log(`${functionFullName}: to`);
                  console.log(pointItemTransactionsArray);
                  for (const transaction of this.pointItemTransactionQuery.getAll()) {
                    pointItemTransactionsArray.push(transaction);
                  }
                } else {
                  console.log(`${functionFullName}: Setting transactions`);
                  console.log(pointItemTransactionsArray);
                }

                console.log(pointItemTransactionsArray);
                this.pointItemTransactionStore.set(pointItemTransactionsArray);
              }));

            if (!this.numBatchRetrieved) {
              this.numBatchRetrieved = 1;
            } else {
              this.numBatchRetrieved += 1;
            }

            observer.next(request$);
            observer.complete();
          }
        });
    });
  }

  public setInitialBatchRetrievedTrue() {
    console.log(`Initial batch retrieved`);
    this.initialBatchRetrieved = true;
  }
}
