import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DEMO_GALLERY_CONF, DEMO_GALLERY_CONF_INLINE, DEMO_GALLERY_IMAGE} from '../../config';
import {GALLERY_CONF, GALLERY_IMAGE, NgxImageGalleryComponent} from 'ngx-image-gallery';
import {AvatarService} from '../avatar/avatar.service';
import { BehaviorSubject } from 'rxjs';
import awsconfig from '../../../aws-exports';
import {ImageService} from '../image.service';
// import {ProfileCardComponent} from '../../user/homepage/profile-card/profile-card.component';
import {API, Storage} from 'aws-amplify';
import {AuthService} from '../../login/auth.service';
import {LeaderboardService} from '../leaderboard.service';
import {FeedcardService} from '../feedcard/feedcard.service';
import {Globals} from '../../globals';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';

declare var $: any;
@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css']
})
export class ImageGalleryComponent implements OnInit {
// get reference to gallery component
  componentName = 'image-gallery.component';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/things';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  public showConf = true;

  @ViewChild('ngxImageGallery') ngxImageGallery: NgxImageGalleryComponent;
  @Output() selected = new EventEmitter<string>();

  title = 'Demo App';

  // gallery configuration
  conf: GALLERY_CONF = DEMO_GALLERY_CONF_INLINE;
  // conf: GALLERY_CONF = DEMO_GALLERY_CONF;

  // gallery images
  // images: GALLERY_IMAGE[] = DEMO_GALLERY_IMAGE;
  images: GALLERY_IMAGE[] = [];
  identities: any = null;
  currentUserId: any = null;

  constructor(private avatarService: AvatarService,
              private imageService: ImageService,
              private achievementService: AchievementService,
              private authService: AuthService,
              private leaderboardService: LeaderboardService,
              private feedcardService: FeedcardService,
              private globals: Globals) {

  }

  ngOnInit(): void {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.avatarService.getAvatars()
      .subscribe((result: any) => {
        result.forEach((image: string) => {
          if ((image.startsWith(`public/avatars/superheroes/`, 0) && (image !== `public/avatars/superheroes/`))) {
            console.log(image);
            const imageObj = {
              // url: 'http://localhost:3000/public/avatars/' + image,
              url: 'https://eps-serverlessc5940ff4146a4cbc86df2d32b803996c-dev.s3.amazonaws.com/' + image,
              // url: image,
              altText: '',
              title: image,
              // thumbnailUrl: 'http://localhost:3000/public/avatars/' + image + '?w=60',
              thumbnailUrl: 'https://eps-serverlessc5940ff4146a4cbc86df2d32b803996c-dev.s3.amazonaws.com/' + image + '?w=60',
              // thumbnailUrl: image + '?w=60',
            };

            this.images.push(imageObj);
          }

          // console.log(imageObj);

        });
      });
  }

  // METHODS
  // open gallery
  openGallery(index: number = 0) {
    // console.log(this.ngxImageGallery);
    // this.ngxImageGallery.open(index);
  }

  // close gallery
  closeGallery() {
    // this.ngxImageGallery.close();
  }

  // set new active(visible) image in gallery
  newImage(index: number = 0) {
    // this.ngxImageGallery.setActiveImage(index);
  }

  // next image in gallery
  nextImage() {
    this.ngxImageGallery.next();
  }

  // prev image in gallery
  prevImage() {
    this.ngxImageGallery.prev();
  }

  /**************************************************/

  // EVENTS
  // callback on gallery opened
  galleryOpened(index) {
    console.log('Gallery opened at index ', index);
  }

  // callback on gallery closed
  galleryClosed() {
    console.log('Gallery closed.');
  }

  // callback on gallery image clicked
  galleryImageClicked(index) {
    const functionName = 'galleryImageClicked';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Gallery image clicked with index ${index}`);

    const split = this.images[index].url.split(`com/`);
    console.log(split);
    const imagePath = split[1];
    const level = imagePath.split('/')[0];
    const imageKey = imagePath.split(`${level}/`)[1];

    console.log(`${functionFullName}: imageKey: ${imageKey}`);

    Storage.get(imageKey, {
      level: ''
    })
      .then((result: any) => {
        console.log(`${functionFullName}: result: ${result}`);
        this.imageService.getImage(result)
          .subscribe(blob => {
            console.log(`${functionFullName}: galleryImageClicked blob:`);
            console.log(blob);
            this.avatarService.saveUserAvatar(blob).subscribe((saveResult) => {
              console.log(`${functionFullName}: saveResult: ${saveResult}`);
              if (saveResult !== false) {
                this.achievementService.incrementAchievement('ChangeAvatar').subscribe();
              }

              this.selected.emit(result);
            });
          });
      });
  }

  // callback on gallery image changed
  galleryImageChanged(index) {
    console.log('Gallery image changed to index ', index);
  }

  // callback on user clicked delete button
  deleteImage(index) {
    console.log('Delete image at index ', index);
  }

}
