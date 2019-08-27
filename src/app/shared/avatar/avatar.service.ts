import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {GALLERY_CONF, GALLERY_IMAGE, NgxImageGalleryComponent} from 'ngx-image-gallery';
import {ImageService} from '../image.service';
import Amplify, {API, Auth, Storage} from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import {AuthService} from '../../login/auth.service';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import {forkJoin, Observable} from 'rxjs';
import {LeaderboardUser} from '../leaderboard.service';
import {FeedcardService} from '../feedcard/feedcard.service';
import {CognitoUser, CognitoUserAttribute} from 'amazon-cognito-identity-js';
import {Globals} from '../../globals';
import {EntityUserAvatarService} from '../../entity-store/user-avatar/state/entity-user-avatar.service';
import {EntityUserAvatarModel} from '../../entity-store/user-avatar/state/entity-user-avatar.model';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {RequestMethod} from '@angular/http';

export interface UserAvatarRelationship {
  // userId: number;
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
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  public userAvatarPath;
  public userAvatarUrl;
  public userAvatarImageToShow;
  public isUserAvatarImageLoading;
  public userAvatarHash: UserAvatarRelationship[] = [];

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private authService: AuthService,
              private globals: Globals,
              private entityUserService: EntityUserService,
              private entityUserAvatarService: EntityUserAvatarService
              ) { }

  ngOnInit(): void {

  }

  /*getAvatar(username: string): Observable<any> {
    const functionName = 'getAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {
            username: username
          };

          API.post(this.apiName, this.apiPath + '/userAvatar', myInit)
            .then(data => {
              console.log(`${functionFullName}: ${username} avatar data retrieved from API`);
              console.log(data);
              observer.next(data.data);
              observer.complete();
            })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving ${username} avatar data from API`);
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
  }*/

  getCurrentUserAvatar(): Observable<any> {
    const functionName = 'getCurrentUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // const username = this.globals.getUsername();
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          // const userPicture = this.globals.getUserAttribute('picture');
          Auth.currentUserInfo()
            .then(userAttributes => {
              const userPicture = userAttributes.picture;
              if (userPicture) {
                console.log(`${functionFullName}: user picture: ${userPicture}`);
                const data = {
                  status: true,
                  avatarUrl: userPicture
                };
                observer.next(data);
                observer.complete();
              } else {
                console.log(`${functionFullName}: unable to find user picture in user attributes... Trying to get avatar from database`);
                const token = user.signInUserSession.idToken.jwtToken;
                const myInit = this.myInit;
                myInit.headers['Authorization'] = token;
                // myInit['body'] = {username: username};

                API.get(this.apiName, this.apiPath + '/getCurrentUserAvatar', myInit).then(data => {
                  console.log(`${functionFullName}: successfully retrieved data from API`);
                  console.log(data);
                  observer.next(data.data);
                  observer.complete();
                });
              }
            });


          /*Auth.userAttributes(user)
            .then((userAttributes: CognitoUserAttribute[]) => {
              const userPicture = userAttributes.find(x => x.getName() === 'picture');
              if (userPicture) {
                console.log(`${functionFullName}: user picture: ${userPicture.getValue()}`);
                const data = {
                  status: true,
                  avatarUrl: userPicture.getValue()
                };
                observer.next(data);
                observer.complete();
              } else {
                console.log(`${functionFullName}: unable to find user picture in user attributes... Trying to get avatar from database`);
                const token = user.signInUserSession.idToken.jwtToken;
                const myInit = this.myInit;
                myInit.headers['Authorization'] = token;
                myInit['body'] = {username: username};

                API.post(this.apiName, this.apiPath + '/getCurrentUserAvatar', myInit).then(data => {
                  console.log(`${functionFullName}: successfully retrieved data from API`);
                  console.log(data);
                  observer.next(data.data);
                  observer.complete();
                });
              }
            });*/
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

              Auth.currentUserInfo()
                .then(userInfo => {
                  const cognitoIdentityIdValue = userInfo.id;
                  const observables: Observable<any>[] = [];

                  // Record new Avatar path in the database
                  observables.push(this.setUserAvatar(`${level}/${cognitoIdentityIdValue}/${result.key}`));

                  // Set new Avatar path in the picture attribute within Cognito profile
                  observables.push(this.setCognitoPictureAttribute(`${level}/${cognitoIdentityIdValue}/${result.key}`));

                  forkJoin(observables)
                    .subscribe(obsResults => {
                      console.log(`${functionFullName}: obsResults:`);
                      console.log(obsResults);

                      this.refreshCurrentUserAvatar()
                        .subscribe(refreshResult => {
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
                })
                .catch(err => {
                  console.log(`${functionFullName}: Error retrieving current user info`);
                  console.log(err);
                  observer.next(false);
                  observer.complete();
                });
            })
            .catch(err => {
              console.log(`${functionFullName}: Error retrieving item from storage`);
              console.log(err);
              observer.next(false);
              observer.complete();
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

  setCognitoPictureAttribute(avatarPath: string): Observable<any> {
    const functionName = 'setCognitoPictureAttribute';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then((user: CognitoUser) => {
          Auth.updateUserAttributes(user, {
            picture: avatarPath
          })
            .then(updateResult => {
              console.log(`${functionFullName}: update attributes success:`);
              console.log(updateResult);
              observer.next(updateResult);
              observer.complete();
            })
            .catch(err => {
              console.log(`${functionFullName}: update attributes error:`);
              console.log(err);
              observer.next(err);
              observer.complete();
            });
        });
    });
  }

  refreshCurrentUserAvatar(): Observable<boolean> {
    const functionName = 'refreshCurrentUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // const userId = +localStorage.getItem('userId');
    // const userId = +this.globals.userDetails.userId;
    return new Observable<boolean>(observer => {
      this.getCurrentUserAvatar()
        .subscribe((res: any) => {
          console.log(`${functionFullName}: result:`);
          console.log(res);

          if (res.status !== false) {
            this.userAvatarPath = res.avatarUrl;
            // this.userAvatarPath = this.globals.getUserAttribute('picture');

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

                const username = this.globals.getUsername();
                const avatarPath = res.avatarUrl;
                const avatarResolvedUrl = resultUrl;
                const avatarBase64String = '';

                this.entityUserService.update(avatarPath, avatarResolvedUrl);
                this.entityUserAvatarService.update(username, avatarPath, avatarResolvedUrl);

                observer.next(true);
                observer.complete();

/*                this.cacheUserAvatarRelationship(userAvatarHashEntry).subscribe(() => {
                  observer.next(true);
                  observer.complete();
                });*/
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

  getUserAvatars(): Observable<any> {
    const functionName = 'getUserAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getUserAvatars', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving user avatars data from API`);
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

  generateRandomAvatar() {
    const functionName = 'generateRandomAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      const noAuthHeader = {
        headers: new HttpHeaders({
          'Accept': '*/*',
          'NoAuth': 'True',
        })
      };
      const uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const proxyurl = 'https://cors-anywhere.herokuapp.com/';
      const avatarUrl = `https://api.adorable.io/avatars/285/${uniqueId}.png`;
      const url = proxyurl + avatarUrl;
      return this.http.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*',
          'NoAuth': 'True',
        }
      })
        .subscribe(result => {
          observer.next({avatarUrl: avatarUrl, result: result});
          observer.complete();
        });
    });

  }
}
