import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {API} from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import {AuthService} from '../../login/auth.service';
import {Observable} from 'rxjs';
import {LeaderboardUser} from '../leaderboard.service';
import {AvatarService} from '../avatar.service';

export interface PointTransaction {
  id: number;
  amount: number;
  sourceUserAvatarPath: string;
  sourceUserAvatarUrl: string;
  sourceUserAvatarCached: boolean;
  sourceUserEmail: string;
  sourceUserFirstName: string;
  sourceUserLastName: string;
  sourceUserId: number;
  sourceUserName: string;
  sourceUserPoints: number;
  targetUserAvatarPath: string;
  targetUserAvatarUrl: string;
  targetUserAvatarCached: boolean;
  targetUserEmail: string;
  targetUserFirstName: string;
  targetUserLastName: string;
  targetUserId: number;
  targetUserName: string;
  targetUserPoints: number;
  type: string;
  createdAt: any;
  description: string;
  sourceUser: LeaderboardUser;
  targetUser: LeaderboardUser;
}

@Injectable({
  providedIn: 'root'
})
export class FeedcardService implements OnInit {
  componentName = 'feedcard.service';
  pointTransactions: PointTransaction[] = [];

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  constructor(private http: HttpClient,
              private authService: AuthService,
              private avatarService: AvatarService) { }

  ngOnInit(): void {
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
            const sourceUser: LeaderboardUser = {
              username: result[i].sourceUserName,
              id: result[i].sourceUserId,
              rank: null,
              name: null,
              avatar: result[i].sourceUserAvatarUrl,
              email: result[i].sourceUserEmail,
              points: result[i].sourceUserPoints,
              position: null,
              department: null
            };

            const targetUser: LeaderboardUser = {
              username: result[i].targetUserName,
              id: result[i].targetUserId,
              rank: null,
              name: null,
              avatar: result[i].targetUserAvatarUrl,
              email: result[i].targetUserEmail,
              points: result[i].targetUserPoints,
              position: null,
              department: null
            };

            // const sourceUserAvatarUrl = this.avatarService.resolveAvatarPath(result[i].sourceUserAvatarUrl);
            // const targetUserAvatarUrl = this.avatarService.resolveAvatarPath(result[i].targetUserAvatarUrl);

            // const sourceUserResolved = this.avatarService.resolveAvatar(sourceUser);
            // const targetUserResolved = this.avatarService.resolveAvatar(targetUser);

            // this.avatarService.resolveAvatar(sourceUser).subscribe();
            // this.avatarService.resolveAvatar(targetUser).subscribe();

            let sourceUserAvatarEntry = null;
            let sourceUserAvatarUrl = null;
            let sourceUserAvatarCached = false;

            sourceUserAvatarEntry = this.avatarService.userAvatarHash.find(x => x.username === result[i].sourceUserName);

            if (sourceUserAvatarEntry) {
              console.log(`${functionFullName}: Retrieved cached user avatar entry for source user ${result[i].sourceUserName}`);
              sourceUserAvatarUrl = sourceUserAvatarEntry.avatarResolvedUrl;
              sourceUserAvatarCached = true;
            } else {
              console.log(`${functionFullName}: Unable to find cached user avatar entry for source user ${result[i].sourceUserName}`);
            }

            let targetUserAvatarEntry = null;
            let targetUserAvatarUrl = null;
            let targetUserAvatarCached = false;

            targetUserAvatarEntry = this.avatarService.userAvatarHash.find(x => x.username === result[i].targetUserName);

            if (targetUserAvatarEntry) {
              console.log(`${functionFullName}: Retrieved cached user avatar entry for target user ${result[i].targetUserName}`);
              targetUserAvatarUrl = targetUserAvatarEntry.avatarResolvedUrl;
              targetUserAvatarCached = true;
            } else {
              console.log(`${functionFullName}: Unable to find cached user avatar entry for target user ${result[i].targetUserName}`);
            }

            const pointTransaction: PointTransaction = {
              id: result[i].id,
              amount: result[i].amount,
              sourceUserAvatarPath: result[i].sourceUserAvatarUrl,
              sourceUserAvatarUrl: sourceUserAvatarUrl,
              sourceUserAvatarCached: sourceUserAvatarCached,
              sourceUserEmail: result[i].sourceUserEmail,
              sourceUserFirstName: result[i].sourceUserFirstName,
              sourceUserLastName: result[i].sourceUserLastName,
              sourceUserId: result[i].sourceUserId,
              sourceUserName: result[i].sourceUserName,
              sourceUserPoints: result[i].sourceUserPoints,
              targetUserAvatarPath: result[i].targetUserAvatarUrl,
              targetUserAvatarUrl: targetUserAvatarUrl,
              targetUserAvatarCached: targetUserAvatarCached,
              targetUserEmail: result[i].targetUserEmail,
              targetUserFirstName: result[i].targetUserFirstName,
              targetUserLastName: result[i].targetUserLastName,
              targetUserId: result[i].targetUserId,
              targetUserName: result[i].targetUserName,
              targetUserPoints: result[i].targetUserPoints,
              type: result[i].type,
              createdAt: result[i].createdAt,
              description: result[i].description,
              sourceUser: sourceUser,
              targetUser: targetUser
            };

            if (this.pointTransactions.find(x => x.id === pointTransaction.id)) {
              // Entry already exists. No need to add it again
              console.log(`${functionFullName}: Entry id ${pointTransaction.id} already exists`);
            } else {
              console.log(`${functionFullName}: Adding entry id ${pointTransaction.id}`);
              this.pointTransactions.push(pointTransaction);
            }
          }

          console.log(`${functionFullName}: PointTransactionResult:`);
          console.log(this.pointTransactions);
          observer.next();
          observer.complete();
        });
    });
  }

  getAvatarForTargetUser(targetUser: LeaderboardUser): Observable<string> {
    const functionName = 'getAvatarFromService';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<string>(observer => {
      this.avatarService.resolveAvatar(targetUser)
        .subscribe(resolvedUser => {
          console.log(`${functionFullName}: resolved user:`);
          console.log(resolvedUser);

          for (let i = 0; i < this.pointTransactions.length; i++) {
            if (this.pointTransactions[i].targetUserName === targetUser.username) {
              console.log(`${functionFullName}: Setting avatar for point transaction targetUser ${targetUser.username}`);
              this.pointTransactions[i].targetUserAvatarUrl = resolvedUser.avatar;
              console.log(`${functionFullName}: Setting targetUserAvatarCached to true for point transaction targetUser ${targetUser.username}`);
              this.pointTransactions[i].targetUserAvatarCached = true;
            }
          }

          observer.next(resolvedUser.avatar);
          observer.complete();
        });
    });
  }

  updatePointTransactionAvatar(targetUsername: string, avatarResolvedUrl: string) {
    const functionName = 'updatePointTransactionAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);


    for (let i = 0; i < this.pointTransactions.length; i++) {
      if (this.pointTransactions[i].targetUserName === targetUsername) {
        this.pointTransactions[i].targetUserAvatarUrl = avatarResolvedUrl;
      }
    }
  }

  addLike(sourceUserId, targetUserId, postId) {
    const functionName = 'addLike';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: GetLike`);
    return this.http.post(environment.apiBaseUrl + 'likeManage', {'sourceUserId': sourceUserId,
      'targetUserId': targetUserId, 'postId': postId});
  }

  refreshPointTransactionAvatars() {
    const functionName = 'refreshPointTransactionAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // Select distinct target usernames from the pointTransactions array
    const distinctTargetUsers = Array.from(new Set(this.pointTransactions.map(x => x.targetUserName)))
      .map(targetUserName => {
        return {
          targetUserName: targetUserName,
          targetUserAvatarPath: this.pointTransactions.find(x => x.targetUserName === targetUserName).targetUserAvatarPath
        };
      });

    console.log(distinctTargetUsers);

    distinctTargetUsers.forEach(distinctTargetUser => {
      const userAvatarHashEntry = this.avatarService.userAvatarHash.find(x => x.username === distinctTargetUser.targetUserName);
      if (userAvatarHashEntry) {
        if (userAvatarHashEntry.avatarPath === distinctTargetUser.targetUserAvatarPath) {
          // Urls match
        } else {
          console.log(`${functionFullName}: Avatar paths don't match for point transaction targetUser ${distinctTargetUser.targetUserName}`);
          for (let i = 0; i < this.pointTransactions.length; i++) {
            if (this.pointTransactions[i].targetUserName === distinctTargetUser.targetUserName) {
              console.log(`${functionFullName}: Setting avatar for point transaction targetUser ${distinctTargetUser.targetUserName}`);
              this.pointTransactions[i].targetUserAvatarUrl = userAvatarHashEntry.avatarResolvedUrl;
            }
          }
        }
      }
    });
  }
}
