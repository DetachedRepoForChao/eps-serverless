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

    Storage.put(`pic-${userId}.png`, this.croppedImage, {
      contentType: `image/png`,
    })
      .then((result: any) => {
        console.log('result:');
        console.log(result);

        Storage.get(result.key)
          .then((resultImage: any) => {
            console.log('resultImage:');
            console.log(resultImage);

            const imagePath = `https://${awsconfig.aws_user_files_s3_bucket}.s3.amazonaws.com/public/pic-${userId}.png`;
            console.log(`imagePath: ${imagePath}`);
            this.avatarService.setUserAvatar(imagePath)
              .then(res => {
                console.log('galleryImageClicked: response:');
                console.log(res);
                this.avatarService.refreshUserAvatar(+localStorage.getItem('userId'));
                $('#myModal').modal('hide');
              });
          });
      })
      .catch(err => console.log(err));
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
