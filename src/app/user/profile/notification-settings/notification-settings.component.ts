import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subject, Subscription, throwError} from 'rxjs';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
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
import {ThemePalette} from '@angular/material';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {catchError, take, takeUntil} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  @Output() returnFromConfirmClick = new EventEmitter<any>();

  componentName = 'notification-settings.component';
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private navigationSubscription: Subscription;

  isImageLoading: boolean;

  currentUser$;
  currentUser: EntityCurrentUserModel;
  userPlaceholder: EntityCurrentUserModel;
  isCardLoading: boolean;



  isUserDataRetrieved = false;

  color: ThemePalette = 'warn';
  checked = false;
  disabled = false;
  toggled = false;

  fieldNotificationsList = {
    user: this.userPlaceholder,
    emailNotifications: false,
    phoneNotifications: false,
    inApp: true,
  };
  fieldNotificationsListSubmitted = false;

  public emailConfirmed = false;
  public phoneConfirmed = false;

  purchaseApprovers = [];
  userPurchaseApproverData: any;

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
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
              private notifierService: NotifierService) {  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('notification-settings-spinner');

    this.authService.currentUserInfo()
      .then(currentUserInfo => {
        console.log(currentUserInfo);
        this.emailConfirmed = currentUserInfo.attributes['email_verified'];
        this.phoneConfirmed = currentUserInfo.attributes['phone_number_verified'];

        this.isUserDataRetrieved = true;
      })
      .catch(err => {
        console.log('Error...', err);
      });

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;

              // Retrieve purchase request manager data if user is an admin
              if (currentUser.securityRole.Id === 3) {
                this.retrievePurchaseApproverConfig(currentUser)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(purchaseApproverData => {
                    this.populateNotificationDataAdmin(currentUser, purchaseApproverData);
                  });
              } else {
                this.populateNotificationData(this.currentUser);
              }
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });


    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('notification-settings-spinner');
  }

  retrievePurchaseApproverConfig(currentUser: EntityCurrentUserModel): Observable<any> {
    return new Observable(observer => {
      this.userService.getPurchaseApprovers()
        .pipe(
          take(1),
          catchError(err => {
            console.log('Error...', err);
            return throwError(err);
          })
        )
        .subscribe(
          (response) => {
            console.log(response);
            this.userPurchaseApproverData = response.find(x => x.userId === currentUser.userId);
            observer.next(this.userPurchaseApproverData);
            // this.purchaseApprovers = response;
          },
          (err) => {
            console.log(err);
            observer.error(err);
          },
          () => {
            console.log('Completed.');
            observer.complete();
          }
        );
    });

  }

  populateNotificationData(currentUser: EntityCurrentUserModel) {
    const functionName = 'populateNotificationData';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.fieldNotificationsList.user = currentUser;
    const keys = Object.keys(currentUser);
    for (const key of keys) {
      if (Object.keys(this.fieldNotificationsList).indexOf(key) > -1) {
        this.fieldNotificationsList[key] = currentUser[key];
      }
    }
  }

  populateNotificationDataAdmin(currentUser: EntityCurrentUserModel, purchaseApproverData) {
    const functionName = 'populateNotificationDataAdmin';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.fieldNotificationsList.user = currentUser;
    const keys = Object.keys(purchaseApproverData);
    for (const key of keys) {
      if (key !== 'user') {
        if (Object.keys(this.fieldNotificationsList).indexOf(key) > -1) {
          this.fieldNotificationsList[key] = purchaseApproverData[key];
        }
      }
    }
  }

  onFieldNotificationListSubmit() {
    console.log(this.fieldNotificationsList);
    this.fieldNotificationsListSubmitted = true;

    const sourceUser = this.fieldNotificationsList.user;
    const user = {};
    const keys = Object.keys(this.fieldNotificationsList);


    /*
    Iterate over the form field keys and add the key/value pair to the user object we'll be passing
    to the modifyUser function. Any fields that were removed will be replaced with the *REMOVE* string
    this will let our function know that those fields should be cleared.
    */
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'user') {
        if (sourceUser[keys[i]] === this.fieldNotificationsList[keys[i]]) {
          // Don't add the key/value pair if the new value is the same as the source
        } else {
          // If the value has changed, add key/value pair to the user object
          console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${this.fieldNotificationsList[keys[i]]}`);
          user[keys[i]] = this.fieldNotificationsList[keys[i]];
        }
      }
    }

    if (Object.keys(user).length > 0) {
      // User object changes exist. Add the userId to the user object and invoke modifyUser function
      user['userId'] = sourceUser.userId;
      user['username'] = sourceUser.username;
      this.currentUserService.modifyUser(user)
        .pipe(take(1))
        .subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.fieldNotificationsListSubmitted = false;
            // this.emailConfirmationCodeSent = true;
            this.notifierService.notify('success', 'Notification settings updated successfully.');


          } else {
            this.notifierService.notify('error', `Submission error`, modifyResult.message);
          }
        });
    } else {
      // User object was not changed
      console.log('There are no changes to the user object');
      this.notifierService.notify('warning', 'There were no changes made.');
      this.fieldNotificationsListSubmitted = false;
    }

    console.log(user);
  }

  onFieldNotificationListSubmitAdmin() {
    console.log(this.fieldNotificationsList);
    this.fieldNotificationsListSubmitted = true;

    const sourceUser = this.fieldNotificationsList.user;
    const sourcePurchaseApproverData = this.userPurchaseApproverData;
    const user = {};
    const keys = Object.keys(this.fieldNotificationsList);


    /*
    Iterate over the form field keys and add the key/value pair to the user object we'll be passing
    to the modifyUser function. Any fields that were removed will be replaced with the *REMOVE* string
    this will let our function know that those fields should be cleared.
    */
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'user') {
        if (sourcePurchaseApproverData[keys[i]] === this.fieldNotificationsList[keys[i]]) {
          // Don't add the key/value pair if the new value is the same as the source
        } else {
          // If the value has changed, add key/value pair to the user object
          console.log(`${keys[i]} value changed from ${sourcePurchaseApproverData[keys[i]]} to ${this.fieldNotificationsList[keys[i]]}`);
          user[keys[i]] = this.fieldNotificationsList[keys[i]];
        }
      }
    }

    if (Object.keys(user).length > 0) {
      // User object changes exist. Add the userId to the user object and invoke modifyUser function
      user['userId'] = sourceUser.userId;
      user['username'] = sourceUser.username;
      this.userService.updatePurchaseApprover(user)
        .pipe(take(1))
        .subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.fieldNotificationsListSubmitted = false;
            // this.emailConfirmationCodeSent = true;
            this.notifierService.notify('success', 'Notification settings updated successfully.');
            this.retrievePurchaseApproverConfig(sourceUser)
              .pipe(take(1))
              .subscribe();

          } else {
            this.notifierService.notify('error', `Submission error`, modifyResult.message);
          }
        });

    } else {
      // User object was not changed
      console.log('There are no changes to the user object');
      this.notifierService.notify('warning', 'There were no changes made.');
      this.fieldNotificationsListSubmitted = false;
    }

    console.log(user);
  }

  toggleFieldPrivacy(field: string) {
    console.log(field);

  }

  onConfirmEmailClick(username: string) {
    console.log('confirm email clicked');
    this.returnFromConfirmClick.emit('email');
    // this.router.navigate(['/', 'user', 'profile', username], {state: {option: 'email'}});
  }

  onConfirmPhoneClick(username: string) {
    console.log('confirm phone clicked');
    this.returnFromConfirmClick.emit('phone');
    // this.router.navigate(['/', 'user', 'profile', username], {state: {option: 'phone'}});
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.navigationSubscription.unsubscribe();
  }
}
