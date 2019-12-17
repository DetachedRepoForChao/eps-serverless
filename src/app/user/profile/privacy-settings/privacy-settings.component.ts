import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AuthService} from '../../../login/auth.service';
import {NotifierService} from 'angular-notifier';
import {ThemePalette} from '@angular/material';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.css']
})
export class PrivacySettingsComponent implements OnInit, OnDestroy {
  componentName = 'privacy-settings.component';
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private usersLoading$ = new Subject();

  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;

  leaderboardUsers: EntityUserModel[];
  currentUser: EntityCurrentUserModel;
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

  constructor(private spinner: NgxSpinnerService,
              public achievementQuery: AchievementQuery,
              public currentUserQuery: EntityCurrentUserQuery,
              private currentUserService: EntityCurrentUserService,
              private userQuery: EntityUserQuery,
              private authService: AuthService,
              private notifierService: NotifierService) { }

  ngOnInit() {
    // const functionName = 'ngOnInit';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('privacy-settings-spinner');

    this.authService.currentUserInfo()
      .then(userInfo => {
        // console.log(userInfo);
        this.isUserDataRetrieved = true;
      });

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1,
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.leaderboardUsers = users;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
              this.populatePrivacyData(currentUser);
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });


    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('privacy-settings-spinner');
  }

  populatePrivacyData(currentUser: EntityCurrentUserModel) {
    // const functionName = 'populatePrivacyData';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    this.fieldPrivacyList.user = currentUser;
    const keys = Object.keys(currentUser);
    for (const key of keys) {
      if (Object.keys(this.fieldPrivacyList).indexOf(key) > -1) {
        this.fieldPrivacyList[key] = currentUser[key];
      }
    }
  }


  onFieldPrivacyListSubmit() {
    // console.log(this.fieldPrivacyList);
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
          // console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${this.fieldPrivacyList[keys[i]]}`);
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
          // console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.fieldPrivacyListSubmitted = false;
            // this.emailConfirmationCodeSent = true;
            this.notifierService.notify('success', 'User record updated successfully.');

            // Retrieve user's new Cognito attributes
            this.authService.currentUserInfo()
              .then(userInfo => {
                // console.log(userInfo);
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
      // console.log('There are no changes to the user object');
      this.notifierService.notify('warning', 'There were no changes made.');
      this.fieldPrivacyListSubmitted = false;
    }

    // console.log(user);
  }

  toggleFieldPrivacy(field: string) {
    // console.log(field);

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.usersLoading$.next();
    this.usersLoading$.complete();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
  }
}


