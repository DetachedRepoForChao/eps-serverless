import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {GALLERY_CONF, GALLERY_IMAGE, NgxImageGalleryComponent} from 'ngx-image-gallery';
import {ImageService} from './image.service';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from "../login/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AvatarService implements OnInit {

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

  async getUserAvatar(userId: string) {
    console.log('getUserAvatar');
    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;
    this.myInit['body'] = {userId: userId};

    return API.post(this.apiName, this.apiPath + '/getUserAvatar', this.myInit).then(data => {
      console.log('serverless getUserAvatar');
      console.log(data);
      return data.data;
    });

    // return this.http.post(environment.apiBaseUrl + '/getUserAvatar', {userId: userId});
  }

/*  getUserAvatar2(userId: string) {
    console.log('getUserAvatar');
    this.http.post(environment.apiBaseUrl + '/getUserAvatar', {userId: userId})
      .subscribe((res: any) => {
        if (res.status !== false) {
          this.userAvatarUrl = res.avatarUrl.avatarUrl;
        }
      });
  }*/

  refreshUserAvatar(userId: string) {
    console.log('refreshUserAvatar');
    this.getUserAvatar(userId)
      .then((res: any) => {
        if (res.status !== false) {
          this.userAvatarUrl = res.avatarUrl;
          this.getImageFromService();
        }
      });
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
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
      this.createImageFromBlob(data);
      this.isUserAvatarImageLoading = false;
    }, error => {
      this.isUserAvatarImageLoading = false;
      console.log(error);
    });
  }

  setUserAvatar(userId: string, avatarUrl: string) {
    console.log('setUserAvatar');
    return this.http.post(environment.apiBaseUrl + '/setUserAvatar', {userId: userId, avatarUrl: avatarUrl});
  }

  async getAvatars() {
    console.log('getAvatars');

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getAvatars', this.myInit).then(data => {
      console.log('serverless getAvatars');
      console.log(data);
      return data.data;
    });

    // return this.http.get(environment.apiBaseUrl + '/getAvatars');
  }
}
