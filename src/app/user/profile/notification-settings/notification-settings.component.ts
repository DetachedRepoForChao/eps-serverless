import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NgxSpinnerService} from 'ngx-spinner';
import {Globals} from '../../../globals';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {CurrentUserStore} from '../../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {UserHasStoreItemQuery} from '../../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {MetricsService} from '../../../entity-store/metrics/state/metrics.service';
import {AuthService} from '../../../login/auth.service';
import {FeatureService} from '../../../entity-store/feature/state/feature.service';
import {NotifierService} from 'angular-notifier';
import Auth from '@aws-amplify/auth';
import {CognitoUser} from "amazon-cognito-identity-js";
import {ThemePalette} from '@angular/material';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';

declare var $: any;

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  componentName = 'notification-settings.component';
  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;

  currentUser$;
  userPlaceholder: EntityCurrentUserModel;
  isCardLoading: boolean;



  isUserDataRetrieved = false;

  color: ThemePalette = 'warn';
  checked = false;
  disabled = false;
  toggled = false;

  fieldPrivacyList = {
    user: this.userPlaceholder,
    emailPublic: false,
    phonePublic: false,
    birthdatePublic: false,
    genderPublic: false,
    pointAwardsPublic: true,
    achievementsPublic: true,
    pointsPublic: true,
    coreValuesPublic: true,
  };
  fieldPrivacyListSubmitted = false;

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
              private userHasStoreItemService: UserHasStoreItemService,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private storeItemService: StoreItemService,
              private metricsService: MetricsService,
              private authService: AuthService,
              private changeDetector: ChangeDetectorRef,
              private featureService: FeatureService,
              private formBuilder: FormBuilder,
              private notifierService: NotifierService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('privacy-settings-spinner');

    this.authService.currentUserInfo()
      .then(userInfo => {
        console.log(userInfo);
        this.isUserDataRetrieved = true;
      });

    this.leaderboardUsers$ = this.userQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.currentUser$ = this.currentUserQuery.selectAll({
      limitTo: 1
    });

    this.currentUser$.subscribe(() => {
      this.populatePrivacyData();
    });

    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('privacy-settings-spinner');
  }

  populatePrivacyData() {
    const functionName = 'populatePrivacyData';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.currentUser$.subscribe(currentUser => {
      const user = currentUser[0];
      console.log(user);
      this.fieldPrivacyList.user = user;
      const keys = Object.keys(user);
      for (const key of keys) {
        if (Object.keys(this.fieldPrivacyList).indexOf(key) > -1) {
          this.fieldPrivacyList[key] = user[key];
        }
      }
    });
  }


  onFieldPrivacyListSubmit() {
    console.log(this.fieldPrivacyList);
    this.fieldPrivacyListSubmitted = true;

    const sourceUser = this.fieldPrivacyList.user;
    const user = {};
    const keys = Object.keys(this.fieldPrivacyList);


    /*
    Iterate over the form field keys and add the key/value pair to the user object we'll be passing
    to the modifyUser function. Any fields that were removed will be replaced with the *REMOVE* string
    this will let our function know that those fields should be cleared.
    */
    for (let i = 0; i < keys.length; i++) {
      if ((keys[i] !== 'user') && (keys[i] !== 'genderCustom')) {
        if (sourceUser[keys[i]] === this.fieldPrivacyList[keys[i]]) {
          // Don't add the key/value pair if the new value is the same as the source
        } else {
          // If the value has changed, add key/value pair to the user object
          console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${this.fieldPrivacyList[keys[i]]}`);
          user[keys[i]] = this.fieldPrivacyList[keys[i]];
        }
      }
    }

    if (Object.keys(user).length > 0) {
      // User object changes exist. Add the userId to the user object and invoke modifyUser function
      user['userId'] = sourceUser.userId;
      user['username'] = sourceUser.username;
      this.currentUserService.modifyUser(user)
        .subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.fieldPrivacyListSubmitted = false;
            // this.emailConfirmationCodeSent = true;
            this.notifierService.notify('success', 'User record updated successfully.');

            // Retrieve user's new Cognito attributes
            this.authService.currentUserInfo()
              .then(userInfo => {
                console.log(userInfo);
                this.isUserDataRetrieved = true;
              })
              .catch(err => {

              });

          } else {
            this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
          }
        });
    } else {
      // User object was not changed
      console.log('There are no changes to the user object');
      this.notifierService.notify('warning', 'There were no changes made.');
      this.fieldPrivacyListSubmitted = false;
    }

    console.log(user);
  }

  toggleFieldPrivacy(field: string) {
    console.log(field);

  }

  ngOnDestroy(): void {
  }
}
