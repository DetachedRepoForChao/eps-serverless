import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar.service';
import {GALLERY_IMAGE} from 'ngx-image-gallery';
import {Globals} from '../../../globals';
import {LeaderboardService, LeaderboardUser} from '../../../shared/leaderboard.service';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {Auth, Storage} from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {UserService} from '../../../shared/user.service';

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
  isCardLoading: boolean;

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private avatarService: AvatarService,
              private globals: Globals,
              private leaderboardService: LeaderboardService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
              private achievementService: AchievementService,
              private userService: UserService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-spinner');

      const text_max = 200;
    $('#count_message').html(text_max + ' remaining');

    $('#text').keyup(function() {
      const text_length = $('#text').val().length;
      const text_remaining = text_max - text_length;

      $('#count_message').html(text_remaining + ' remaining');
    });

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

/*    for (let i = 0; i < leaderboardUsers.length; i++) {
      observables.push(this.avatarService.resolveAvatar(leaderboardUsers[i]));
    }*/

    observables.push(this.leaderboardService.getUserPointsLeaderboardRecord(this.globals.getUsername()));
    observables.push(this.avatarService.refreshCurrentUserAvatar());

    forkJoin(observables)
      .subscribe(obsResults => {
        console.log(`${functionFullName}: obsResults:`);
        console.log(obsResults);

        // Iterate over the returned values from the observables so we can act appropriately on each
        obsResults.forEach(obsResult => {
          console.log(`${functionFullName}: obsResult:`);
          console.log(obsResult);

          // Act on observable value that was returned from leaderboardService.getUserPointsLeaderboardRecord()
          if (obsResult.avatar) {
            console.log(`${functionFullName}: obsResult.avatar: ${obsResult.avatar}`);
            this.userLeaderboardRecord = obsResult;
          }

        });

        this.isImageLoading = false;
        this.isCardLoading = false;
        this.spinner.hide('profile-card-spinner');

        /*     console.log(`${functionFullName}: forkJoin`);
             console.log(`${functionFullName}: leaderboardUserArray`);
             console.log(leaderboardUserArray);*/

/*        leaderboardUserArray.forEach(resolvedLeaderboardUser => {
          // const resolvedAvatarUrl = data['userAchievementProgress'].find(x => x.achievement_id === item['achievement'].id);

          leaderboardUsersNew = leaderboardUsersNew.concat(resolvedLeaderboardUser);
        });*/

        // this.leaderboardUsersTop = leaderboardUsersNew.slice(0, 4);

        // return {status: true, message: `${functionFullName}: resolvedAvatarUrls retrieved successfully`};
      });

/*    this.leaderboardService.getUserPointsLeaderboardRecord(+localStorage.getItem('userId'))
      .subscribe(userLeaderboardRecord => {
        this.userLeaderboardRecord = userLeaderboardRecord;
      });
    this.avatarService.refreshCurrentUserAvatar().subscribe();*/
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
        this.leaderboardService.isUserInLeaderboardTop5(this.globals.getUsername()).subscribe(isTop5Result => {
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
        });

        this.feedcardService.refreshPointTransactionAvatars();
        $('#myModal').modal('hide');
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

  Debug() {

    const avatarPath = this.globals.getUserAttribute('picture');
    const level = avatarPath.split('/')[0];
    const cognitoIdentityId = avatarPath.split('/')[1];
    const key = avatarPath.split('/')[2];

    console.log('avatarPath');
    console.log(avatarPath);

    Auth.currentUserInfo().then(result => console.log(result));

    Storage.get(key, {
      level: level,
      identityId: cognitoIdentityId
    })
      .then(result => {
        console.log(result);
        this.avatarService.userAvatarUrl = result;
      })
      .catch(err => {
        console.log('Error');
        console.log(err);
      });
  }

}
