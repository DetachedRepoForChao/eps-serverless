import { PointItemTransactionStore } from './point-item-transaction.store';
import { PointItemTransactionQuery} from './point-item-transaction.query';
import { createPointItemTransactionModel, PointItemTransactionModel } from './point-item-transaction.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/point-item-transaction-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {BehaviorSubject, forkJoin, Observable, of, Subject} from 'rxjs';
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
  coreValues = [];

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
      const coreValues = this.coreValues.find(x => x.userId === userId);
      if (coreValues) {
        console.log(`${functionFullName}: Core values for user ${userId} already retrieved`, coreValues);
        observer.next(coreValues);
        observer.complete();
      } else {
        this.authService.currentAuthenticatedUser()
          .then(user => {
            const token = user.signInUserSession.idToken.jwtToken;
            const myInit = this.myInit;
            myInit.headers['Authorization'] = token;
            myInit['body'] = {
              userId: userId
            };

            API.post(this.apiName, this.apiPath + '/getUserCoreValues', myInit).then(response => {
              console.log(`${functionFullName}: successfully retrieved data from API`);
              console.log(response);
              const userCoreValues = {
                userId: userId,
                coreValues: response.data.coreValues,
              };

              this.coreValues.push(userCoreValues);

              observer.next(response.data.coreValues);
              observer.complete();
            })
              .catch(err => {
                console.log(`${functionFullName}: error retrieving features data from API`, err);
                observer.error(err);
                observer.complete();
              });
          })
          .catch(err => {
            console.log(`${functionFullName}: error getting current authenticated user from auth service`, err);
            observer.error(err);
            observer.complete();
          });
      }
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


  getAddPointItemTransactionsRange(startIndex: number, numberRecords: number): Observable<any> {
    const functionName = 'getAddPointItemTransactionsRange';
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

          API.post(this.apiName, this.apiPath + '/getAddPointTransactionRange', myInit).then(response => {
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
                    // console.log(`${functionFullName}: adding transaction: ${transactionId}`);
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
                    let likedByCurrentUser = false;
                    if (likes) {
                      for (const like of likes) {
                        if (like.username === username) {
                          likedByCurrentUser = true;
                          break;
                        }
                      }
                    }

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
                    // console.log(`${functionFullName}: adding transaction: ${transactionId}`);
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
                    let likedByCurrentUser = false;
                    if (likes) {
                      for (const like of likes) {
                        if (like.username === username) {
                          likedByCurrentUser = true;
                          break;
                        }
                      }
                    }

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

  cacheAddPointItemTransactionsBatch() {
    const functionName = 'cacheAddPointItemTransactionsBatch';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const numberRecords = 10;
    let startIndex: number;
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

          // Check if transactions for this batch have already been cached
          if (this.numBatchRetrieved && (this.numBatchRetrieved * 10) >= startIndex) {
            // Point transactions for this batch have already been retrieved
            console.log(`${functionFullName}: Point transactions for range [${startIndex} - ${startIndex + numberRecords}] have already been retrieved`);
            observer.next(false);
            observer.complete();
          } else {
            const request$ = this.getAddPointItemTransactionsRange(startIndex, numberRecords)
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
                    // console.log(`${functionFullName}: adding transaction: ${transactionId}`);
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
                    let likedByCurrentUser = false;
                    if (likes) {
                      for (const like of likes) {
                        if (like.username === username) {
                          likedByCurrentUser = true;
                          break;
                        }
                      }
                    }
                    // const likedByCurrentUser = (pointItemTransaction.likeInfos && pointItemTransaction.likeInfos.username === username) ? true : false;

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


  addLike(targetUserId: number, postId: number): Observable<any> {
    const functionName = 'addLike';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    // Add Like to database
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          this.authService.currentUserInfo()
            .then(currentUser => {
              const likingUsername = currentUser.username;
              console.log(`${functionFullName}: likingUsername: ${likingUsername}; targetUserId: ${targetUserId}; postId: ${postId}`);
              const token = user.signInUserSession.idToken.jwtToken;
              const myInit = this.myInit;
              myInit.headers['Authorization'] = token;
              myInit['body'] = {
                targetUserId: targetUserId,
                postId: postId
              };

              API.post(this.apiName, this.apiPath + '/addLike', myInit)
                .then(response => {
                  console.log(`${functionFullName}: successfully retrieved data from API`);
                  console.log(response);
                  if (response.data.status !== false) {
                    // Add Like to the local point transactions list
                    // const targetPointTransaction = this.pointTransactions.find(x => x.id === postId);
                    // const targetPointTransaction = this.pointItemTransactionQuery.getAll({
                    //   filterBy: e => e.transactionId === postId
                    // })[0];

                    const newLike = {
                      id: response.data.likeId,
                      postId: postId,
                      username: user.username,
                      createdAt: response.data.createdAt,
                    };

                    this.updateAddLike(postId, newLike);
                    // targetPointTransaction.likes.push(newLike);
                    // targetPointTransaction.likedByCurrentUser = true;

                    observer.next(response.data);
                    observer.complete();
                  } else {
                    console.log(`${functionFullName}: API call came back with status ${response.data.status}: ${response.data.message}`);
                    console.log(response.data.likeRecord);
                    observer.next(response.data);
                    observer.complete();
                  }
                })
                .catch(err => {
                  console.log(`${functionFullName}: error making API call`);
                  console.log(err);
                  observer.next(err);
                  observer.complete();
                });
            })
            .catch(err => {
              console.log(`${functionFullName}: error getting authenticated user`);
              console.log(err);
              observer.next(err);
              observer.complete();
            });
        });

    });
  }

  updateAddLike(transactionId: number, newLike: any) {
    const targetTransaction = this.pointItemTransactionQuery.getAll({
      filterBy: e => e.transactionId === transactionId
    })[0];

    const newLikesArray = [];
    newLikesArray.push(newLike);
    for (const like of targetTransaction.likes) {
      newLikesArray.push(like);
    }
    console.log('new likes array');
    console.log(newLikesArray);
    this.pointItemTransactionStore.update((e) => e.transactionId === transactionId, {
      likes: newLikesArray,
      likedByCurrentUser: true
    });
  }

  removeLike(postId: number): Observable<any> {
    const functionName = 'removeLike';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // Remove Like from database
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          this.authService.currentUserInfo()
            .then(currentUser => {
              const likingUsername = currentUser.username;
              const token = user.signInUserSession.idToken.jwtToken;
              const myInit = this.myInit;
              myInit.headers['Authorization'] = token;
              myInit['body'] = {
                postId: postId
              };

              API.post(this.apiName, this.apiPath + '/removeLike', myInit).then(data => {
                console.log(`${functionFullName}: successfully retrieved data from API`);
                console.log(data);
                if (data.data.status !== false) {
                  // Remove Like from the local point transactions list
                  // const targetPointTransaction = this.pointTransactions.find(x => x.id === postId);
                  // targetPointTransaction.likeData = targetPointTransaction.likeData.filter(x => x.username !== likingUsername);
                  // targetPointTransaction.likedByCurrentUser = false;

                  this.updateRemoveLike(postId, likingUsername);

                  observer.next(data.data);
                  observer.complete();
                } else {
                  console.log(`${functionFullName}: API call came back with status ${data.data.status}: ${data.data.message}`);
                  observer.next(data.data);
                  observer.complete();
                }
              });
            });
        });
    });
  }

  updateRemoveLike(transactionId: number, username: string) {
    const targetTransaction = this.pointItemTransactionQuery.getAll({
      filterBy: e => e.transactionId === transactionId
    })[0];

    const newLikesArray = targetTransaction.likes.filter(x => x.username !== username);
    console.log('new likes array');
    console.log(newLikesArray);
    this.pointItemTransactionStore.update((e) => e.transactionId === transactionId, {
      likes: newLikesArray,
      likedByCurrentUser: false
    });
  }


  resetState() {
    this.retrievedUserIds = [];
    this.retrievedManagerIds = [];
    this.numBatchRetrieved = null;
    this.initialBatchRetrieved = false;
  }
}
