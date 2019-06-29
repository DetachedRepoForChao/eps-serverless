import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {GALLERY_CONF, GALLERY_IMAGE, NgxImageGalleryComponent} from 'ngx-image-gallery';
import {ImageService} from './image.service';

@Injectable({
  providedIn: 'root'
})
export class AvatarService implements OnInit {

  // public images: GALLERY_IMAGE[] = [];

  public userAvatarUrl;
  public userAvatarImageToShow;
  public isUserAvatarImageLoading;

  constructor(private http: HttpClient, private imageService: ImageService) { }

  ngOnInit(): void {

  }

  getUserAvatar(userId: string) {
    console.log('getUserAvatar');
    return this.http.post(environment.apiBaseUrl + '/getUserAvatar', {userId: userId});
  }

  getUserAvatar2(userId: string) {
    console.log('getUserAvatar');
    this.http.post(environment.apiBaseUrl + '/getUserAvatar', {userId: userId})
      .subscribe((res: any) => {
        if (res.status !== false) {
          this.userAvatarUrl = res.avatarUrl.avatarUrl;
        }
      });
  }

  refreshUserAvatar(userId: string) {
    console.log('refreshUserAvatar');
    this.getUserAvatar(userId)
      .subscribe((res: any) => {
        if (res.status !== false) {
          this.userAvatarUrl = res.avatarUrl.avatarUrl;
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

  getAvatars() {
    console.log('getAvatars');
    return this.http.get(environment.apiBaseUrl + '/getAvatars');
  }
}
