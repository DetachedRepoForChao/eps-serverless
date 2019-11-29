import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {API} from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import {AuthService} from '../../login/auth.service';
import {Observable} from 'rxjs';
import {LeaderboardUser} from '../leaderboard.service';

export interface PointTransaction {
  id: number;
  amount: number;
  // sourceUserAvatarPath: string;
  // sourceUserAvatarUrl: string;
  // sourceUserAvatarCached: boolean;
  sourceUserEmail: string;
  sourceUserFirstName: string;
  sourceUserLastName: string;
  sourceUserId: number;
  sourceUserName: string;
  sourceUserPoints: number;
  // targetUserAvatarPath: string;
  // targetUserAvatarUrl: string;
  // targetUserAvatarCached: boolean;
  targetUserEmail: string;
  targetUserFirstName: string;
  targetUserLastName: string;
  targetUserId: number;
  targetUserName: string;
  targetUserPoints: number;
  type: string;
  createdAt: any;
  description: string;
  pointItemName: string;
  pointItemCoreValues: string;
  sourceUser: LeaderboardUser;
  targetUser: LeaderboardUser;
  likeData: Like[];
  likedByCurrentUser: boolean;
}

export interface LikingUser {
  id: number;
  username: string;
  departmentName: string;
  departmentId: number;

}

export interface Like {
  id: number;
  postId: number;
  // userId: number;
  username: string;
  departmentName: string;
  departmentId: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeedcardService implements OnInit {
  componentName = 'feedcard.service';
  pointTransactions: PointTransaction[] = [];
  pointTransactionsLimited: PointTransaction[] = [];

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  ngOnInit(): void {
  }

  clearPointTransactionCache() {
    const functionName = 'clearPointTransactionCache';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.pointTransactions = [];
    this.pointTransactionsLimited = [];
  }

  getPointTransaction(): Observable<any> {
    const functionName = 'getPointTransaction';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // const user = await this.authService.currentAuthenticatedUser();
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointTransaction', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  populatePointTransactions(): Observable<any> {
    const functionName = 'populatePointTransactions';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.getPointTransaction()
        .subscribe((result: any) => {
          console.log(`${functionFullName}: result:`);
          console.log(result);
          // this.PointTransactions = point_transactions['PointTransactionResult'];
          // console.log('PointTransactionResult:' + point_transactions['PointTransactionResult']);
          for (let i = 0; i < result.length; i++) {
            if (result[i].pointItem) {
              const sourceUser: LeaderboardUser = {
                username: result[i].sourceUser.username,
                id: result[i].sourceUser.id,
                rank: null,
                name: null,
                avatar: result[i].sourceUser.avatarUrl,
                email: result[i].sourceUser.email,
                points: result[i].sourceUser.points,
                position: null,
                department: null
              };

              const targetUser: LeaderboardUser = {
                username: result[i].targetUser.username,
                id: result[i].targetUser.id,
                rank: null,
                name: null,
                avatar: result[i].targetUser.avatarUrl,
                email: result[i].targetUser.email,
                points: result[i].targetUser.points,
                position: null,
                department: null
              };


              const pointTransaction: PointTransaction = {
                id: result[i].id,
                amount: result[i].amount,

                sourceUserEmail: result[i].sourceUser.email,
                sourceUserFirstName: result[i].sourceUser.firstName,
                sourceUserLastName: result[i].sourceUser.lastName,
                sourceUserId: result[i].sourceUser.id,
                sourceUserName: result[i].sourceUser.username,
                sourceUserPoints: result[i].sourceUser.points,

                targetUserEmail: result[i].targetUser.email,
                targetUserFirstName: result[i].targetUser.firstName,
                targetUserLastName: result[i].targetUser.lastName,
                targetUserId: result[i].targetUser.id,
                targetUserName: result[i].targetUser.username,
                targetUserPoints: result[i].targetUser.points,
                type: result[i].type,
                createdAt: result[i].createdAt,
                description: result[i].description,

                pointItemName: result[i].pointItem.name,
                pointItemCoreValues: result[i].pointItem.coreValues,
                sourceUser: sourceUser,
                targetUser: targetUser,
                likeData: [],
                likedByCurrentUser: false
              };

              if (this.pointTransactions.find(x => x.id === pointTransaction.id)) {
                // Entry already exists. No need to add it again
                console.log(`${functionFullName}: Entry id ${pointTransaction.id} already exists`);
              } else {
                console.log(`${functionFullName}: Adding entry id ${pointTransaction.id}`);
                this.pointTransactions.push(pointTransaction);
              }
            }


          }

          console.log(`${functionFullName}: PointTransactionResult:`);
          console.log(this.pointTransactions);

          console.log(`${functionFullName}: Setting PointTransactionsLimited to the top 5 most recent entries:`);
          this.pointTransactionsLimited = this.pointTransactions.sort(function(a, b) { return b.id - a.id; } ).slice(0, 5);

          // Retrieve Likes info and merge it into the point transactions list
          const pointTransactionIds = this.pointTransactions.map((pointTransaction) => pointTransaction.id);
          this.getLikes(pointTransactionIds)
            .subscribe((likeData: any) => {
              if (!likeData) {
                console.log(`${functionFullName}: did not retrieve any like data`);
                observer.next();
                observer.complete();
              } else {
                console.log(`${functionFullName}: retrieved like data successfully:`);
                console.log(likeData);

                // Match up and merge Like data into point transactions list
                for (let i = 0; i < likeData.length; i++) {
                  const correspondingPost = this.pointTransactions.find(x => x.id === likeData[i].postId);
                  if (correspondingPost) {
                    if (correspondingPost.likeData.find(x => x.id === likeData[i].id)) {
                      console.log(`${functionFullName}: Like already attached to this point transaction`);
                    } else {
                      console.log(`${functionFullName}: adding like id ${likeData[i].id} to point transaction id ${correspondingPost.id}`);
                      correspondingPost.likeData.push(likeData[i]);
                    }

                    // Check if post has been liked by the current user
                    this.authService.currentUserInfo()
                      .then(currentUser => {
                        const username = currentUser.username;
                        if (likeData[i].username === username) {
                          correspondingPost.likedByCurrentUser = true;
                        } else {
                          console.log(`${functionFullName}: like ${likeData[i].id} by user ${likeData[i].username}` +
                            ` is not liked by user ${username}`);
                        }
                      });

                  }
                }


                console.log(`${functionFullName}: point transaction list after adding like data:`);
                console.log(this.pointTransactions);
                observer.next();
                observer.complete();
              }
            });

          // observer.next();
          // observer.complete();
        });
    });
  }

  /*  updatePointTransactionAvatar(targetUsername: string, avatarResolvedUrl: string) {
      const functionName = 'updatePointTransactionAvatar';
      const functionFullName = `${this.componentName} ${functionName}`;
      console.log(`Start ${functionFullName}`);


      for (let i = 0; i < this.pointTransactions.length; i++) {
        if (this.pointTransactions[i].targetUserName === targetUsername) {
          this.pointTransactions[i].targetUserAvatarUrl = avatarResolvedUrl;
        }
      }
    }*/

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
                .then(data => {
                  console.log(`${functionFullName}: successfully retrieved data from API`);
                  console.log(data);
                  if (data.data.status !== false) {
                    // Add Like to the local point transactions list
                    const targetPointTransaction = this.pointTransactions.find(x => x.id === postId);
                    const newLike: Like = {
                      id: data.data.likeId,
                      postId: postId,
                      // userId: likingUserId,
                      username: user.username,
                      departmentId: +user.attributes['custom:department_id'],
                      departmentName: user.attributes['custom:department'],
                    };

                    targetPointTransaction.likeData.push(newLike);
                    targetPointTransaction.likedByCurrentUser = true;

                    observer.next(data.data);
                    observer.complete();
                  } else {
                    console.log(`${functionFullName}: API call came back with status ${data.data.status}: ${data.data.message}`);
                    console.log(data.data.likeRecord);
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
                  const targetPointTransaction = this.pointTransactions.find(x => x.id === postId);
                  targetPointTransaction.likeData = targetPointTransaction.likeData.filter(x => x.username !== likingUsername);
                  targetPointTransaction.likedByCurrentUser = false;

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

  getLikes(postIds: number[]): Observable<any> {
    const functionName = 'getLikes';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: retrieving Like data for the following point transaction ids:`);
    console.log(postIds);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            postIds: postIds
          };

          API.post(this.apiName, this.apiPath + '/getLikesByPostIds', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

}
