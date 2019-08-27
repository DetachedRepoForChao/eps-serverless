import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar/avatar.service';
import {Globals} from '../../../globals';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {PointItemService} from '../../../shared/point-item.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {UserStore} from '../../../entity-store/user/state/user.store';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {UserService} from '../../../shared/user.service';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card-manager',
  templateUrl: './profile-card-manager.component.html',
  styleUrls: ['./profile-card-manager.component.css']
})
export class ProfileCardManagerComponent implements OnInit {
  componentName = 'profile-card-manager.component';
  isImageLoading: boolean;
  isCardLoading: boolean;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageToShow: any = '';

  constructor(private http: HttpClient,
              private imageService: ImageService,
              public avatarService: AvatarService,
              public globals: Globals,
              private leaderboardService: LeaderboardService,
              public pointItemService: PointItemService,
              private spinner: NgxSpinnerService,
              private feedcardService: FeedcardService,
              private achievementService: AchievementService,
              private userService: UserService,
              private userStore: UserStore,
              public userQuery: EntityUserQuery,
              private entityUserService: EntityUserService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-manager-spinner');

    this.entityUserService.cacheCurrentUserAvatar().subscribe();

    if (!this.globals.userDetails) {
      this.userService.getUserProfile()
        .subscribe(userDetails => {
          this.globals.userDetails = userDetails;
        });
    } else if (this.globals.userDetails.username !== this.globals.getUsername()) {
      this.userService.getUserProfile()
        .subscribe(userDetails => {
          this.globals.userDetails = userDetails;
        });
    }

    const observables: Observable<any>[] = [];

    observables.push(this.pointItemService.storeRemainingPointPool());
    observables.push(this.avatarService.refreshCurrentUserAvatar());

    forkJoin(observables)
      .subscribe(obsResults => {
        console.log(`${functionFullName}: obsResults:`);
        console.log(obsResults);

        // Iterate over the returned values from the observables so we can act appropriately on each
        obsResults.forEach(obsResult => {
          console.log(`${functionFullName}: obsResult:`);
          console.log(obsResult);
        });

        this.isImageLoading = false;
        this.isCardLoading = false;
        this.spinner.hide('profile-card-manager-spinner');
      });
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }

  onImageSelected(event) {
    const functionName = 'onImageSelected';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: event: ${event}`);
    console.log(`${functionFullName}: this.croppedImage: ${this.croppedImage}`);


    this.avatarService.saveUserAvatar(this.croppedImage).subscribe((saveResult) => {
      console.log(`${functionFullName}: saveResult: ${saveResult}`);
      this.feedcardService.refreshPointTransactionAvatars();
      $('#myModal').modal('hide');
    });
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageToShow = event.base64;
    this.croppedImage = event.file;
  }
  imageLoaded() {
    console.log('Image Loaded');
    // document.getElementById(`button_${this.coreValueButtonList[i].Name}`).className = document.getElementById(`button_${this.coreValueButtonList[i].Name}`).className.replace('toggled', '').trim();
    // const sourceImage = document.getElementsByClassName('source-image')[0];
    // console.log(sourceImage);

    // document.getElementsByClassName('source-image')[0].className += ' source-image-fixed';
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
}
