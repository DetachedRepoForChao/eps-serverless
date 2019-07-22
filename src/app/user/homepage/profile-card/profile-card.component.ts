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

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {

  isImageLoading: boolean;
  userLeaderboardRecord;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageToShow: any = '';

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private avatarService: AvatarService,
              public globals: Globals,
              public leaderboardService: LeaderboardService) { }

  ngOnInit() {
      const text_max = 200;
    $('#count_message').html(text_max + ' remaining');

    $('#text').keyup(function() {
      const text_length = $('#text').val().length;
      const text_remaining = text_max - text_length;

      $('#count_message').html(text_remaining + ' remaining');
    });

    this.leaderboardService.getUserPointsLeaderboardRecord(+localStorage.getItem('userId'))
      .then(userLeaderboardRecord => {
        this.userLeaderboardRecord = userLeaderboardRecord;
      });
    this.avatarService.refreshUserAvatar(+localStorage.getItem('userId'));
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }

  onImagePreviewLoaded(event) {
    console.log(event);
  }

  onImageSelected(event) {
    console.log(event);
    console.log(this.croppedImage);

    const userId = +localStorage.getItem('userId');

    this.avatarService.saveUserAvatar(this.croppedImage).then();
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
