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

  public userAvatarUrl;
  public userAvatarImageToShow;
  public isUserAvatarImageLoading;

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private authService: AuthService) { }

  ngOnInit(): void {

  }

  async getUserAvatar(userId: number) {
    const functionName = 'getUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;
    myInit['body'] = {userId: userId};

    return API.post(this.apiName, this.apiPath + '/getUserAvatar', myInit).then(data => {
      console.log(`${functionFullName}: successfully retrieved data from API`);
      console.log(data);
      return data.data;
    });
  }

  saveUserAvatar(image) {
    const userId = +localStorage.getItem('userId');
    return Storage.put(`pic-${userId}.png`, image, {
      level: 'private',
      contentType: `image/png`,
    })
      .then((result: any) => {
        console.log('result:');
        console.log(result);

        Storage.get(result.key, {
          level: 'private'
        })
          .then((resultImage: any) => {
            console.log('resultImage:');
            console.log(resultImage);

            this.setUserAvatar(result.key)
              .then(res => {
                console.log('galleryImageClicked: response:');
                console.log(res);
                this.refreshUserAvatar(+localStorage.getItem('userId'));
              });
          });
      })
      .catch(err => console.log(err));
  }

  refreshUserAvatar(userId: number) {
    console.log('refreshUserAvatar');
    this.getUserAvatar(userId)
      .then((res: any) => {
        console.log('refreshUserAvatar getUserAvatar result:');
        console.log(res);

        if (res.status !== false) {
          Storage.get(res.avatarUrl, {
            level: 'private'
          })
            .then((resultUrl: any) => {
              console.log('refreshUserAvatar Storage.get resultImage:');
              console.log(resultUrl);

              this.userAvatarUrl = resultUrl;
              // this.userAvatarImageToShow = res.avatarUrl;
              this.getImageFromService();
            });
        }
      });
  }

  createImageFromBlob(image: Blob) {
    console.log('createImageFromBlob');
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      console.log('userAvatarImageToShow blob:');
      console.log(reader.result);
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
      console.log('getImageFromService data');
      console.log(data);
      this.createImageFromBlob(data);
      this.isUserAvatarImageLoading = false;
    }, error => {
      this.isUserAvatarImageLoading = false;
      console.log(error);
    });
  }

  async setUserAvatar(avatarUrl: string) {
    const functionName = 'setUserAvatar';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;
    myInit['body'] = {avatarUrl: avatarUrl};

    return API.post(this.apiName, this.apiPath + '/setUserAvatar', myInit).then(data => {
      console.log(`${functionFullName}: successfully retrieved data from API`);
      console.log(data);
      return data.data;
    });
  }

  async getAvatars() {
    const functionName = 'getAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getAvatars', myInit).then(data => {
      console.log(`${functionFullName}: successfully retrieved data from API`);
      console.log(data);
      return data.data;
    });

    // return this.http.get(environment.apiBaseUrl + '/getAvatars');
  }
}
