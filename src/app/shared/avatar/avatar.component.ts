import {Component, Input, OnInit} from '@angular/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {AvatarService} from './avatar.service';
import {LeaderboardService} from '../leaderboard.service';
import {Globals} from '../../globals';
import {FeedcardService} from '../feedcard/feedcard.service';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements OnInit {
  @Input() avatarUrl: string;

  componentName = 'avatar.component';
  isImageLoading: boolean;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageToShow: any = '';
  isCardLoading: boolean;

  avatarUpload = false;
  avatarSelect = false;
  avatarPreview = true;

  constructor(private avatarService: AvatarService,
              private leaderboardService: LeaderboardService,
              private globals: Globals,
              private feedcardService: FeedcardService,
              private entityCurrentUserService: EntityCurrentUserService,
              public userQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    this.croppedImageToShow = this.userQuery.getCurrentUserAvatar()[0].avatarResolvedUrl;
    console.log('croppedImageToShow:');
    console.log(this.croppedImageToShow);
  }

  toggleAvatarUpload() {
    this.avatarUpload = true;
    this.avatarSelect = false;
    this.avatarPreview = false;
  }

  toggleAvatarSelect() {
    this.avatarSelect = true;
    this.avatarUpload = false;
    this.avatarPreview = false;
  }

  onImageSelected(event) {
    const functionName = 'onImageSelected';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: event: ${event}`);
    console.log(`${functionFullName}: this.croppedImage: ${this.croppedImage}`);


    this.avatarService.saveUserAvatar(this.croppedImage).subscribe((saveResult) => {
      console.log(`${functionFullName}: saveResult: ${saveResult}`);
      if (saveResult === true) {
/*        this.leaderboardService.isUserInLeaderboardTop5(this.globals.getUsername()).subscribe(isTop5Result => {
          console.log(`${functionFullName}: isTop5Result: ${isTop5Result}`);
          if (isTop5Result === true) {
            console.log(`${functionFullName}: user is in the Leaderboard Top 5. Refreshing leaderboard data`);
            this.leaderboardService.getPointsLeaderboard()
              .subscribe(leaderboardData => {
                console.log(`${functionFullName}: populating leaderboard data`);
                this.leaderboardService.populateLeaderboardDataSource(leaderboardData).subscribe(() => {
                  console.log(`${functionFullName}: leaderboard data populated`);
                });
              });
          }
        });*/

        this.feedcardService.refreshPointTransactionAvatars();

        this.avatarUpload = false;
        this.avatarPreview = true;
      }

    });
  }

  onSuperheroSelected(event) {
    console.log(event);
    this.avatarSelect = false;
    this.avatarPreview = true;
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageToShow = event.base64;
    this.croppedImage = event.file;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  generateRandomAvatar() {
    this.avatarSelect = false;
    this.avatarUpload = false;
    this.avatarPreview = true;

    this.avatarService.generateRandomAvatar()
      .subscribe((data: any) => {
        const currentFn = this;
        const reader = new FileReader();
        reader.readAsDataURL(data.result);
        reader.onloadend = function() {
          const base64data = reader.result;
          console.log(base64data);
          console.log(data.avatarUrl);
          currentFn.avatarUrl = base64data.toString();
          currentFn.entityCurrentUserService.updateAvatar(data.avatarUrl);
          currentFn.avatarService.saveUserAvatar(data.result).subscribe();
        };
      });
  }
}
