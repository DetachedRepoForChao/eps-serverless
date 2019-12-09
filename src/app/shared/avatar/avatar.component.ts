import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {AvatarService} from './avatar.service';
import {LeaderboardService} from '../leaderboard.service';
import {Globals} from '../../globals';
import {FeedcardService} from '../feedcard/feedcard.service';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements OnInit, OnDestroy {
  @Input() avatarUrl: string;

  componentName = 'avatar.component';
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  isImageLoading: boolean;
  currentUser: EntityCurrentUserModel;
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
              public currentUserQuery: EntityCurrentUserQuery,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery
              ) { }


  ngOnInit() {
    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
              this.croppedImageToShow = this.currentUser.avatarResolvedUrl;
              console.log('croppedImageToShow:');
              console.log(this.croppedImageToShow);
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });
    // this.croppedImageToShow = this.currentUserQuery.getCurrentUser()[0].avatarResolvedUrl;

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


    this.avatarService.saveUserAvatar(this.croppedImage)
      .pipe(take(1))
      .subscribe((saveResult) => {
      console.log(`${functionFullName}: saveResult: ${saveResult}`);
      if (saveResult !== false) {
        console.log('save result !== false');
        this.achievementService.incrementAchievement('ChangeAvatar')
          .pipe(take(1))
          .subscribe();
        this.avatarUpload = false;
        this.avatarPreview = true;

      } else {
        console.log('save result !== false');
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
      .pipe(take(1))
      .subscribe((data: any) => {
        const currentFn = this;
        const reader = new FileReader();
        reader.readAsDataURL(data.result);
        reader.onloadend = function() {
          const base64data = reader.result;
          console.log(base64data);
          console.log(data.avatarUrl);
          currentFn.avatarUrl = base64data.toString();
          // currentFn.entityCurrentUserService.updateAvatar(data.avatarUrl);
          currentFn.avatarService.saveUserAvatar(data.result)
            .pipe(take(1))
            .subscribe((saveResult) => {
            if (saveResult !== false) {
              currentFn.achievementService.incrementAchievement('ChangeAvatar')
                .pipe(take(1))
                .subscribe();
            }
          });
        };
      });
  }

  getCompleteAchievementById(id: number) {
    return this.achievementQuery.getCompleteAchievementById(id);
  }

  matfunction(){
    return "please complete the achievement four"
  }

  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
