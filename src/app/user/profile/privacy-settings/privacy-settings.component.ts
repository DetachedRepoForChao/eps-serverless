import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
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

declare var $: any;

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.css']
})
export class PrivacySettingsComponent implements OnInit {
  componentName = 'privacy-settings.component';
  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;

  currentUser$;
  isCardLoading: boolean;

  fieldPrivacyForm: FormGroup;
  fieldPrivacyFormSubmitted = false;

  isUserDataRetrieved = false;

  color: ThemePalette = 'warn';
  checked = false;
  disabled = false;
  toggled = false;

  fieldPrivacyList = {
    email: false,
    phone: false,
    birthdate: false,
    gender: false,
    sharePointAwards: true,
    achievementsVisible: true,
    pointsVisible: true,
    coreValuesVisible: true,
  };

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

    this.loadFieldPrivacyForm();

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
      // this.populateFormData();
    });

    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('privacy-settings-spinner');
  }
/*

  populateFormData() {
    const functionName = 'populateFormData';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    this.currentUser$.subscribe(currentUser => {
      const user = currentUser[0];
      console.log(user);
      this.editUserForm.patchValue({user: user});
      const keys = Object.keys(user);
      for (let i = 0; i < keys.length; i++) {

        const key = keys[i];
        if (this.editUserForm.get(key)) {
          // We must take special consideration for selection objects like securityRole and department
          switch (key) {
            case 'gender': {
              console.log('gender');
              console.log(user[keys[i]]);
              if (((user[keys[i]] !== 'Male') && (user[keys[i]] !== 'Female') && (user[keys[i]] !== 'Prefer Not to Say')) && (user[keys[i]])) {
                this.editUserForm.patchValue({[key]: 'Custom'});
                this.editUserForm.patchValue({genderCustom: user[keys[i]]});
              } else {
                this.editUserForm.patchValue({[key]: user[keys[i]]});
              }
              break;
            }
            case 'email': {
              this.editUserForm.patchValue({[key]: user[keys[i]]});
              this.email = user[keys[i]];
              break;
            }
            case 'phone': {
              this.editUserForm.patchValue({[key]: user[keys[i]]});
              this.phone = user[keys[i]];
              break;
            }
            case 'preferredName': {
              if (user[keys[i]]) {
                this.editUserForm.patchValue({[key]: user[keys[i]]});
              } else {
                this.editUserForm.patchValue({[key]: `${user['firstName']} ${user['lastName']}`});
                console.log('setting ' + key + ' to ' + user['firstName'] + ' ' + user['lastName']);
              }
              break;
            }
            case 'quote': {
              console.log('quote: ');
              console.log(key);
              console.log(user[keys[i]]);
              this.editUserForm.patchValue({[key]: user[keys[i]]});
              break;
            }
            default: {
              this.editUserForm.patchValue({[key]: user[keys[i]]});
            }
          }
        }
      }
    });
  }
*/

  // Creates the Edit User reactive form
  private loadFieldPrivacyForm() {
    const functionName = 'loadFieldPrivacyForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    this.fieldPrivacyForm = this.formBuilder.group({
      user: [null, Validators.required],
      email: [null],
      phone: [null],
      birthdate: [null],
      gender: [null],
      sharePointAwards: [null],
      achievementsVisible: [null],
      pointsVisible: [null],
      coreValuesVisible: [null],
    });
  }



  onFieldPrivacyFormSubmit(form: FormGroup) {
    console.log(form);
    this.fieldPrivacyFormSubmitted = true;

    const sourceUser = form.controls.user.value;
    const user = {};
    const keys = Object.keys(form.controls);


    // Proceed only if the form is valid
    if (!form.invalid) {

      /*
      Iterate over the form field keys and add the key/value pair to the user object we'll be passing
      to the modifyUser function. Any fields that were removed will be replaced with the *REMOVE* string
      this will let our function know that those fields should be cleared.
      *//*
      for (let i = 0; i < keys.length; i++) {
        if ((keys[i] === 'birthdate')) {
          const date = new Date(form.controls[keys[i]].value);
          const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            console.log('Date value changed:');
            console.log(`Old value: ${sourceUser[keys[i]]}; New value: ${dateString}`);

            user[keys[i]] = dateString;
          }
        } else if (keys[i] === 'email') {
          if (sourceUser[keys[i]] === form.controls['email'].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls['email'].value}`);
            this.emailChanged = true;
            user[keys[i]] = form.controls['email'].value;
          }
        } else if (keys[i] === 'phone') {
          const sourcePhone = `+1${this.validatePhoneNumber(sourceUser['phone'])}`;
          if (phone === sourcePhone) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            console.log(`${keys[i]} value changed from ${sourcePhone} to ${phone}`);
            this.phoneChanged = true;
            user[keys[i]] = phone;
          }
        } else if (keys[i] === 'gender') {
          if (form.controls[keys[i]].value === 'Custom') {
            if ((sourceUser[keys[i]] === form.controls['genderCustom'].value) || (form.controls['genderCustom'].value.length === 0)) {
              // Don't add the key/value pair if the new value is the same as the source or empty
            } else {
              console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls['genderCustom'].value}`);
              user[keys[i]] = form.controls['genderCustom'].value;
            }
          } else {
            if ((sourceUser[keys[i]] === form.controls['gender'].value) || (form.controls['gender'].value.length === 0)) {
              // Don't add the key/value pair if the new value is the same as the source or empty
            } else {
              console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls['gender'].value}`);
              user[keys[i]] = form.controls['gender'].value;
            }
          }
        } else if ((keys[i] !== 'user') && (keys[i] !== 'genderCustom')) {
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // If the value has changed, add key/value pair to the user object
            console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls[keys[i]].value}`);
            user[keys[i]] = form.controls[keys[i]].value;
          }
        }
      }*/

      if (Object.keys(user).length > 0) {
        // User object changes exist. Add the userId to the user object and invoke modifyUser function
        user['userId'] = sourceUser.userId;
        user['username'] = sourceUser.username;
        this.currentUserService.modifyUser(user)
          .subscribe(modifyResult => {
            console.log(modifyResult);
            if (modifyResult.status !== false) {
              this.fieldPrivacyFormSubmitted = false;
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
        this.fieldPrivacyFormSubmitted = false;
      }

      console.log(user);
      // form.controls.user.reset();
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  toggle(event) {
    console.log(event);
  }

}


