import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {EntityUserModel} from '../../entity-store/user/state/entity-user.model';
import {HttpClient} from '@angular/common/http';
import {ImageService} from '../../shared/image.service';
import {Globals} from '../../globals';
import {LeaderboardService} from '../../shared/leaderboard.service';
import {FeedcardService} from '../../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import {UserService} from '../../shared/user.service';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {UserHasStoreItemQuery} from '../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {MetricsService} from '../../entity-store/metrics/state/metrics.service';
import {AuthService} from '../../login/auth.service';
import {FeatureService} from '../../entity-store/feature/state/feature.service';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
// import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {NotifierService} from 'angular-notifier';
import Auth from '@aws-amplify/auth';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {environment} from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  componentName = 'profile.component';
  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;

  pendingBalance$;
  currentUser$;
  isCardLoading: boolean;
  email;
  phone;
  currentView = 'editProfile';

  constructor(private http: HttpClient,
              private spinner: NgxSpinnerService,
              private globals: Globals,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private currentUserStore: CurrentUserStore,
              public currentUserQuery: EntityCurrentUserQuery,
              private currentUserService: EntityCurrentUserService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const observables: Observable<any>[] = [];
    observables.push(
      this.currentUserService.cacheCurrentUser(),
      this.userService.cacheUsers(),
      this.achievementService.cacheAchievements(),
      this.storeItemService.cacheStoreItems(),
      this.userHasStoreItemService.cacheUserHasStoreItemRecords()
    );

    forkJoin(observables)
      .subscribe(() => {

      });

    this.userHasStoreItemService.getPendingBalance().subscribe(balance => {
      console.log('balance: ' + balance);
      this.currentUserService.updatePointsBalance(balance);
    });

    this.isImageLoading = false;
    this.isCardLoading = false;
  }

  onEditProfileClick() {
    this.currentView = 'editProfile';
  }

  onChangePasswordClick() {
    this.currentView = 'changePassword';
  }

  onPrivacySettingsClick() {
    this.currentView = 'privacySettings';
  }

}


