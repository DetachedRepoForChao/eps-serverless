import { Component, OnInit } from '@angular/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {AvatarService} from '../avatar/avatar.service';
import {LeaderboardService} from '../leaderboard.service';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent implements OnInit {
  componentName = 'image-cropper.component';
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageToShow: any = '';
  isCardLoading: boolean;

  constructor(public userQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
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
