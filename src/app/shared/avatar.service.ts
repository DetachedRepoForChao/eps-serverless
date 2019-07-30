import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {GALLERY_CONF, GALLERY_IMAGE, NgxImageGalleryComponent} from 'ngx-image-gallery';
import {ImageService} from './image.service';
import Amplify, {API, Storage} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from "../login/auth.service";
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import {Observable} from 'rxjs';
import {LeaderboardUser} from './leaderboard.service';
import {FeedcardService} from './feedcard/feedcard.service';

export interface UserAvatarRelationship {
  userId: number;
  username: string;
  avatarBase64String: string;
  avatarPath: string;
  avatarUrl: string;
  avatarResolvedUrl: string;
  dateModified: any;
}

@Injectable({
  providedIn: 'root'
})
export class AvatarService implements OnInit {
  componentName = 'avatar.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  public userAvatarPath;
  public userAvatarUrl;
  public userAvatarImageToShow;
  public isUserAvatarImageLoading;
  public userAvatarHash: UserAvatarRelationship[] = [];

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private authService: AuthService) { }

  ngOnInit(): void {

  }

  getUserAvatar(userId: number): Observable<any> {
    const functionName = 'getUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {userId: userId};

          API.post(this.apiName, this.apiPath + '/getUserAvatar', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  // Saves new avatar image and deletes old
  saveUserAvatar(image): Observable<boolean> {
    const functionName = 'saveUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    let oldAvatarPath;
    let oldAvatarLevel;
    let oldAvatarCognitoIdentityId;
    let oldAvatarKey;

    if (this.userAvatarPath) {
      oldAvatarPath = this.userAvatarPath;
      oldAvatarLevel = oldAvatarPath.split('/')[0];
      oldAvatarCognitoIdentityId = oldAvatarPath.split('/')[1];
      oldAvatarKey = oldAvatarPath.split('/')[2];

      console.log(`${functionFullName}: oldAvatarPath: ${oldAvatarPath}`);
      console.log(`${functionFullName}: oldAvatarLevel: ${oldAvatarLevel}`);
      console.log(`${functionFullName}: oldAvatarCognitoIdentityId: ${oldAvatarCognitoIdentityId}`);
      console.log(`${functionFullName}: oldAvatarKey: ${oldAvatarKey}`);
    } else {

    }



    const uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const fileName = 'avatar_' + uniqueId + '.png';
    console.log(`${functionFullName}: filename: ${fileName}`);

    const level = 'protected';

    return new Observable<boolean>(observer => {
      // Save the new avatar image
      Storage.put(fileName, image, {
        level: level,
        contentType: `image/png`,
      })
        .then((result: any) => {
          console.log(`${functionFullName}: result:`);
          console.log(result);

          Storage.get(result.key, {
            level: level
          })
            .then((resultImage: any) => {
              console.log(`${functionFullName}: resultImage:`);
              console.log(resultImage);

              const localStorageItems = [];
              for ( let i = 0; i < localStorage.length; i++) {
                localStorageItems.push(localStorage.key(i));
              }

              // Get Cognito ID in order to record the appropriate path in the database
              const cognitoIdentityId = localStorageItems.find((x: string) => x.includes('aws.cognito.identity-id') === true);
              const cognitoIdentityIdValue = localStorage.getItem(cognitoIdentityId);

              // Record new Avatar path in the database
              this.setUserAvatar(`${level}/${cognitoIdentityIdValue}/${result.key}`)
                .subscribe(() => {
                  console.log(`${functionFullName}: setUserAvatar subscribed`);
                  // console.log(res);
                  this.refreshCurrentUserAvatar().subscribe(refreshResult => {
                    console.log(`${functionFullName}: refreshResult: ${refreshResult}`);
                    if (refreshResult === true) {
                      // Delete old Avatar image if there was one
                      if (oldAvatarKey) {
                        Storage.remove(oldAvatarKey, {
                          level: oldAvatarLevel,
                          identityId: oldAvatarCognitoIdentityId
                        }).then(removeResult => {
                          console.log(`${functionFullName}: Deleted old avatar file:`);
                          console.log(removeResult);
                        });
                      }

                      observer.next(true);
                      observer.complete();
                    }
                  });
                });
            });
        })
        .catch(err => {
          console.log(`${functionFullName}: Error:`);
          console.log(err);
          observer.next(false);
          observer.complete();
        });
    });
  }

  refreshCurrentUserAvatar(): Observable<boolean> {
    const functionName = 'refreshCurrentUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const userId = +localStorage.getItem('userId');

    return new Observable<boolean>(observer => {
      this.getUserAvatar(userId)
        .subscribe((res: any) => {
          console.log(`${functionFullName}: result:`);
          console.log(res);

          if (res.status !== false) {
            this.userAvatarPath = res.avatarUrl;

            const level = res.avatarUrl.split('/')[0];
            const cognitoIdentityId = res.avatarUrl.split('/')[1];
            const key = res.avatarUrl.split('/')[2];

            Storage.get(key, {
              level: level,
              identityId: cognitoIdentityId
            })
              .then((resultUrl: any) => {
                console.log(`${functionFullName}: Storage.get resultUrl:`);
                console.log(resultUrl);

                this.userAvatarUrl = resultUrl;

                const userAvatarHashEntry: UserAvatarRelationship = {
                  username: localStorage.getItem('username'),
                  userId: +localStorage.getItem('userId'),
                  avatarPath: this.userAvatarPath,
                  avatarResolvedUrl: this.userAvatarUrl,
                  avatarBase64String: null,
                  avatarUrl: null,
                  dateModified: Date.now()
                };

                this.cacheUserAvatarRelationship(userAvatarHashEntry).subscribe(() => {
                  observer.next(true);
                  observer.complete();
                });
              });
          }
        });
    });
  }

  createImageFromBlob(image: Blob) {
    const functionName = 'createImageFromBlob';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      // console.log('userAvatarImageToShow blob:');
      // console.log(reader.result);
      this.userAvatarImageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImageFromService() {
    console.log('getImageFromService');
    this.isUserAvatarImageLoading = true;
    this.imageService.getImage(this.userAvatarUrl).subscribe(data => {
      // console.log('getImageFromService data');
      // console.log(data);
      this.createImageFromBlob(data);
      this.isUserAvatarImageLoading = false;
    }, error => {
      this.isUserAvatarImageLoading = false;
      console.log(error);
    });
  }

   setUserAvatar(avatarUrl: string): Observable<any> {
    const functionName = 'setUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {avatarUrl: avatarUrl};

          API.post(this.apiName, this.apiPath + '/setUserAvatar', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  getAvatars(): Observable<any> {
    const functionName = 'getAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getAvatars', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

  resolveAvatar(leaderboardUser: any): Observable<any> {
    const functionName = 'resolveAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: leaderboardUser:`);
    console.log(leaderboardUser);

    console.log(`${functionFullName}: userAvatarHash:`);
    console.log(this.userAvatarHash);

    const currentAvatarPath = leaderboardUser.avatar;

    const level = leaderboardUser.avatar.split('/')[0];
    const cognitoIdentityId = leaderboardUser.avatar.split('/')[1];
    const key = leaderboardUser.avatar.split('/')[2];

    console.log(`${functionFullName}: key: ${key}`);
    console.log(`${functionFullName}: identityId: ${cognitoIdentityId}`);

    return new Observable<any>((observer) => {
      let avatarResolvedUrl = null;
      // Try to find the resolved avatar URL in the userAvatarHash
      // if (this.userAvatarHash.length > 0) {
      console.log(`${functionFullName}: Checking if resolved avatar URL exists in the userAvatarHash`);
      const userAvatarRelationship = this.userAvatarHash.find(x => ((x.username === leaderboardUser.username) ||
        (x.userId === leaderboardUser.id)) && (x.avatarPath === currentAvatarPath));

      if (userAvatarRelationship) {
        console.log(`${functionFullName}: Found resolved avatar URL in userAvatarHash`);
        console.log(`${functionFullName}: Current avatarPath for user ${leaderboardUser.username}: ${currentAvatarPath}`);
        console.log(`${functionFullName}: Hashed avatarPath for user ${leaderboardUser.username}: ${userAvatarRelationship.avatarPath}`);

        avatarResolvedUrl = userAvatarRelationship.avatarResolvedUrl;
      } else {
        console.log(`${functionFullName}: Did not find resolved avatar URL in userAvatarHash`);
      }
      // }

      if (!avatarResolvedUrl) {
        console.log(`${functionFullName}: Resolved avatar URL was not retrieved from the userAvatarHash. Resolving the URL using the Storage API`);
        Storage.get(key, {
          level: level,
          identityId: cognitoIdentityId
        })
          .then((avatarUrl: string) => {
            console.log(`${functionFullName}: avatarUrl: ${avatarUrl}`);

            const userAvatarHashEntry: UserAvatarRelationship = {
              username: leaderboardUser.username,
              userId: leaderboardUser.id,
              avatarPath: leaderboardUser.avatar,
              avatarResolvedUrl: avatarUrl,
              avatarBase64String: null,
              avatarUrl: null,
              dateModified: Date.now()
            };

            this.cacheUserAvatarRelationship(userAvatarHashEntry).subscribe();

            leaderboardUser.avatar = avatarUrl;
            observer.next(leaderboardUser);
            observer.complete();
          });
      } else {
        console.log(`${functionFullName}: Resolved avatar URL was successfully retrieved from the userAvatarHash`);

        leaderboardUser.avatar = avatarResolvedUrl;
        observer.next(leaderboardUser);
        observer.complete();
      }
    });
  }

  cacheUserAvatarRelationship(userAvatarRelationship: UserAvatarRelationship): Observable<any> {
    const functionName = 'cacheUserAvatarRelationship';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      console.log(`${functionFullName}: Adding userAvatarRelationship to userAvatarHash`);
      console.log(`${functionFullName}: username: ${userAvatarRelationship.username}`);
      console.log(`${functionFullName}: avatarResolvedUrl: ${userAvatarRelationship.avatarResolvedUrl}`);

      console.log(`${functionFullName}: Checking if user entry exists in userAvatarHash`);
      const userAvatarEntry = this.userAvatarHash.find(x => (x.username === userAvatarRelationship.username) ||
        (x.userId === userAvatarRelationship.userId));

      if (userAvatarEntry) {
        // User entry exists in userAvatarHash. We're going to update it
        console.log(`${functionFullName}: User entry exists in userAvatarHash. We're going to update it`);
        const index = this.userAvatarHash.indexOf(userAvatarEntry);
        this.userAvatarHash[index].avatarPath = userAvatarRelationship.avatarPath;
        this.userAvatarHash[index].dateModified = userAvatarRelationship.dateModified;
        this.userAvatarHash[index].avatarResolvedUrl = userAvatarRelationship.avatarResolvedUrl;
      } else {
        console.log(`${functionFullName}: User entry does not exist in userAvatarHash. Creating one`);
        this.userAvatarHash.push(userAvatarRelationship);
      }

      observer.next();
      observer.complete();
    });
  }

  resolveAvatarPath(avatarPath: string): Observable<string> {
    const functionName = 'resolveAvatarUrl';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: avatarPath: ${avatarPath}`);
    const level = avatarPath.split('/')[0];
    const cognitoIdentityId = avatarPath.split('/')[1];
    const key = avatarPath.split('/')[2];

    console.log(`${functionFullName}: key: ${key}`);
    console.log(`${functionFullName}: identityId: ${cognitoIdentityId}`);

    return new Observable<string>((observer) => {
      Storage.get(key, {
        level: level,
        identityId: cognitoIdentityId
      })
        .then((avatarUrl: string) => {
          console.log(`${functionFullName}: avatarUrl: ${avatarUrl}`);
          observer.next(avatarUrl);
          observer.complete();
        });
    });

  }

  getAvatarFromCache(username: string): string {
    const functionName = 'getAvatarFromCache';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    let userAvatarResolvedUrl = null;
    const userAvatarEntry = this.userAvatarHash.find(x => (x.username === username));
    if (userAvatarEntry) {
      console.log(`${functionFullName}: Found avatar entry for user ${username} in the avatarUserHash`);
      userAvatarResolvedUrl = userAvatarEntry.avatarResolvedUrl;
    } else {
      console.log(`${functionFullName}: Did not find avatar entry for user ${username} in the avatarUserHash`);
    }

    return userAvatarResolvedUrl;
  }
}
