import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar.service';
import {GALLERY_IMAGE} from 'ngx-image-gallery';
import {Globals} from '../../../globals';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {Storage} from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {
  componentName = 'profile-card.component';
  isImageLoading: boolean;
  userLeaderboardRecord;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageToShow: any = '';

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private avatarService: AvatarService,
              public globals: Globals,
              public leaderboardService: LeaderboardService,
              private feedcardService: FeedcardService) { }

  ngOnInit() {
      const text_max = 200;
    $('#count_message').html(text_max + ' remaining');

    $('#text').keyup(function() {
      const text_length = $('#text').val().length;
      const text_remaining = text_max - text_length;

      $('#count_message').html(text_remaining + ' remaining');
    });

    this.leaderboardService.getUserPointsLeaderboardRecord(+localStorage.getItem('userId'))
      .subscribe(userLeaderboardRecord => {
        this.userLeaderboardRecord = userLeaderboardRecord;
      });
    this.avatarService.refreshCurrentUserAvatar().subscribe();
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }

  onImagePreviewLoaded(event) {
    console.log(event);
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
        this.leaderboardService.isUserInLeaderboardTop5(+localStorage.getItem('userId')).subscribe(isTop5Result => {
          console.log(`${functionFullName}: isTop5Result: ${isTop5Result}`);
          if (isTop5Result === true) {
            console.log(`${functionFullName}: user is in the Leaderboard Top 5. Refreshing leaderboard data`);
            this.leaderboardService.getPointsLeaderboard()
              .then(leaderboardData => {
                console.log(`${functionFullName}: populating leaderboard data`);
                this.leaderboardService.populateLeaderboardDataSource(leaderboardData).subscribe(() => {
                  console.log(`${functionFullName}: leaderboard data populated`);
                });
              });
          }
        });

        this.feedcardService.refreshPointTransactionAvatars();
      }

    });
  }

  encode(data) {
    const str = data.reduce(function(a, b) { return a + String.fromCharCode(b); }, '');
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
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


}
