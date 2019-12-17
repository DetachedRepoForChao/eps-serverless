import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, pipe, Subject} from 'rxjs';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {HttpClient} from '@angular/common/http';

import {Globals} from '../../../globals';

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
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {NotifierService} from 'angular-notifier';
import Auth from '@aws-amplify/auth';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {take, takeUntil, tap} from 'rxjs/operators';
import 'rxjs/add/observable/interval';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';


declare var $: any;

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() option;
  @Output() clearOption = new EventEmitter<any>();

  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private userLoading$ = new Subject();

  optionExecuted = false;
  componentName = 'edit-profile.component';
  isImageLoading: boolean;
  leaderboardUsers: EntityUserModel[];

  currentUser$;
  currentUser: EntityCurrentUserModel;

  isCardLoading: boolean;

  // public config: PerfectScrollbarConfigInterface = {};
  phoneValidationError: string;
  editUserForm: FormGroup;
  editUserFormSubmitted = false;
  emailConfirmed;
  phoneConfirmed;
  isUserDataRetrieved = false;
  email;
  phone;
  confirmEmailFormSubmitted = false;
  confirmPhoneFormSubmitted = false;
  phoneChanged = false;
  emailChanged = false;
  quoteLengthMax = 1000;

  confirmEmailForm = this.formBuilder.group({
    code: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])]
  });

  confirmPhoneForm = this.formBuilder.group({
    code: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])]
  });

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
    // const functionName = 'ngOnInit';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('edit-profile-spinner');

    this.loadEditUserForm();

    this.authService.currentUserInfo()
      .then(userInfo => {
        // console.log(userInfo);
        this.emailConfirmed = userInfo.attributes['email_verified'];
        this.phoneConfirmed = userInfo.attributes['phone_number_verified'];
        this.isUserDataRetrieved = true;
      });


    this.userQuery.selectLoading()
      .pipe(takeUntil(this.userLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1,
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.leaderboardUsers = users;
            });

          this.userLoading$.next();
          this.userLoading$.complete();
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
              this.populateFormData();
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });



    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('edit-profile-spinner');
  }

  // This is used to make Angular display the date correctly instead of being 1 day off due to
  // the way time zones work...
  fudgeDate(date): Date {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(new Date(date).getTime() + offset);
  }

  populateFormData() {
    const functionName = 'populateFormData';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    const user = this.currentUser;
    // console.log(user);
    this.editUserForm.patchValue({user: user});
    const keys = Object.keys(user);
    for (let i = 0; i < keys.length; i++) {

      const key = keys[i];
      if (this.editUserForm.get(key)) {
        // We must take special consideration for selection objects like securityRole and department
        switch (key) {
          case 'gender': {
            // console.log('gender');
            // console.log(user[keys[i]]);
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
              // console.log('setting ' + key + ' to ' + user['firstName'] + ' ' + user['lastName']);
            }
            break;
          }
          case 'birthdate': {
            this.editUserForm.patchValue({[key]: this.fudgeDate(user[keys[i]])});
            break;
          }
          case 'quote': {
            // console.log('quote: ');
            // console.log(key);
            // console.log(user[keys[i]]);
            this.editUserForm.patchValue({[key]: user[keys[i]]});
            break;
          }
          default: {
            this.editUserForm.patchValue({[key]: user[keys[i]]});
          }
        }
      }
    }
/*    this.currentUser$.subscribe(currentUser => {

    });*/
  }

  ngAfterViewInit(): void {
  }

  onConfirmEmailClick() {
    this.authService.verifyEmail();
  }

  avatarClick() {
    $('#avatarModal').modal('show');
  }

  executeOption(field) {
    if (!this.option) {
      // Don't do anything since no option was passed
    } else {
      // console.log('current optionExecuted: ' + this.optionExecuted);
      // this.optionExecuted = true;

      if (this.option === field) {
        // console.log('starting observable');
        Observable.interval(5000)
          .pipe(take(1))
          .subscribe(() => {
            // console.log('setting option to null');
            this.option = null;
          });

        if (field === 'quote') {
          this.clearOption.emit(true);
        }
      }


    }
  }


  // Creates the Edit User reactive form
  private loadEditUserForm() {
    const functionName = 'loadEditUserForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);
    this.editUserForm = this.formBuilder.group({
      user: [null, Validators.required],
      preferredName: [null],
      // prefix: [null],
      // suffix: [null],
      // position: [null],
      // preferredPronoun: [null],
      gender: [null],
      genderCustom: [null],
      birthdate: [null],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required],
      quote: [null, Validators.compose([Validators.maxLength(this.quoteLengthMax)])],
    });
  }


// Validates and formats the phone number by stripping out anything except number characters
  validateFormPhoneNumber(phone: string): (string | null) {
    // console.log(phone);
    this.phoneValidationError = null;
    // Strip out all characters except numbers
    const newVal = phone.replace(/\D+/g, '');
    // console.log (newVal);
    if (newVal.length === 10) {
      return newVal;
    } else if (newVal.length > 10) {
      // The phone number value ended up getting an extra digit because of the quirk with the way the
      // phoneMask works... Prompt the user to retype the phone number.
      // console.log(`Phone validation error. Phone length: ${newVal.length}`);
      this.phoneValidationError = 'There was an error processing the phone number. Please retype the phone number.';
      this.editUserForm.controls.phone.reset();
      return null;
    } else {
      // console.log(`Phone validation error. Phone length: ${newVal.length}`);
      this.phoneValidationError = 'The phone number must be 10 digits long.';
      return null;
    }
  }

  validatePhoneNumber(phone: string): (string | null) {
    // console.log(phone);
    // Strip out all characters except numbers
    const newVal = phone.replace(/\D+/g, '');
    // console.log (newVal);
    if (newVal.length === 10) {
      return newVal;
    } else {
      // console.log(`Phone validation error. Phone length: ${newVal.length}`);
      return null;
    }
  }

  onEditUserFormSubmit(form: FormGroup) {
    // console.log(form);
    this.editUserFormSubmitted = true;
    this.phoneChanged = false;
    this.emailChanged = false;

    const sourceUser = form.controls.user.value;
    const user = {};
    const keys = Object.keys(form.controls);


    // Proceed only if the form is valid
    if (!form.invalid) {
      // Format the phone number
      let phone = this.validateFormPhoneNumber(form.controls.phone.value);
      // console.log(phone);
      if (!phone) {
        // Phone number validation failed.
        // console.log('The form submission is invalid');
        this.notifierService.notify('error', 'Please fix the errors and try again.');
        return;
      } else {
        phone = `+1${this.validatePhoneNumber(form.controls.phone.value)}`;
      }
      // form.controls.phone.setValue(phone);

      /*
      Iterate over the form field keys and add the key/value pair to the user object we'll be passing
      to the modifyUser function. Any fields that were removed will be replaced with the *REMOVE* string
      this will let our function know that those fields should be cleared.
      */
      for (let i = 0; i < keys.length; i++) {
        if ((keys[i] === 'birthdate')) {
          const date = new Date(form.controls[keys[i]].value);
          const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // console.log('Date value changed:');
            // console.log(`Old value: ${sourceUser[keys[i]]}; New value: ${dateString}`);

            user[keys[i]] = dateString;
          }
        } else if (keys[i] === 'email') {
          if (sourceUser[keys[i]] === form.controls['email'].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls['email'].value}`);
            this.emailChanged = true;
            user[keys[i]] = form.controls['email'].value;
          }
        } else if (keys[i] === 'phone') {
          const sourcePhone = `+1${this.validatePhoneNumber(sourceUser['phone'])}`;
          if (phone === sourcePhone) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // console.log(`${keys[i]} value changed from ${sourcePhone} to ${phone}`);
            this.phoneChanged = true;
            user[keys[i]] = phone;
          }
        } else if (keys[i] === 'gender') {
          if (form.controls[keys[i]].value === 'Custom') {
            if ((sourceUser[keys[i]] === form.controls['genderCustom'].value) || (form.controls['genderCustom'].value.length === 0)) {
              // Don't add the key/value pair if the new value is the same as the source or empty
            } else {
              // console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls['genderCustom'].value}`);
              user[keys[i]] = form.controls['genderCustom'].value;
            }
          } else {
            if ((sourceUser[keys[i]] === form.controls['gender'].value) || (form.controls['gender'].value.length === 0)) {
              // Don't add the key/value pair if the new value is the same as the source or empty
            } else {
              // console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls['gender'].value}`);
              user[keys[i]] = form.controls['gender'].value;
            }
          }
        } else if ((keys[i] !== 'user') && (keys[i] !== 'genderCustom')) {
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // If the value has changed, add key/value pair to the user object
            // console.log(`${keys[i]} value changed from ${sourceUser[keys[i]]} to ${form.controls[keys[i]].value}`);
            user[keys[i]] = form.controls[keys[i]].value;
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
            // console.log(modifyResult);
            if (modifyResult.status !== false) {
              this.editUserFormSubmitted = false;
              // this.emailConfirmationCodeSent = true;
              this.notifierService.notify('success', 'User record updated successfully.');

              // Retrieve user's new Cognito attributes
              this.authService.currentUserInfo()
                .then(userInfo => {
                  // console.log(userInfo);
                  this.emailConfirmed = userInfo.attributes['email_verified'];
                  this.phoneConfirmed = userInfo.attributes['phone_number_verified'];
                  this.isUserDataRetrieved = true;
                })
                .catch(err => {

                });

              if (this.phoneChanged || this.emailChanged) {
                $('#confirmPromptModal').modal('show');
              }
            } else {
              this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
            }
          });
      } else {
        // User object was not changed
        // console.log('There are no changes to the user object');
        this.notifierService.notify('warning', 'There were no changes made.');
        this.editUserFormSubmitted = false;
      }

      // console.log(user);
      // form.controls.user.reset();
    } else {
      // console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  /*  sendEmailConfirmationCode() {
      Auth.at
    }*/

  onEmailConfirmClick() {
    this.email = this.editUserForm.controls.email.value;
  }

  onPhoneConfirmClick() {
    this.phone = this.editUserForm.controls.phone.value;
  }

  sendEmailCodeAgain() {
    // console.log(this.email);
    Auth.currentAuthenticatedUser()
      .then((currentUser: CognitoUser) => {
        currentUser.getAttributeVerificationCode('email', {
          onSuccess: () => {
            // console.log('success!');
          },
          onFailure: (err) => {
            // console.log('an error occurred');
            // console.log(err);
          },
          inputVerificationCode: (data: string) => {
            // console.log(data);
          }
        });
      });
  }

  sendPhoneCodeAgain() {
    // console.log(this.phone);
    Auth.currentAuthenticatedUser()
      .then((currentUser: CognitoUser) => {
        currentUser.getAttributeVerificationCode('phone_number', {
          onSuccess: () => {
            // console.log('success!');
          },
          onFailure: (err) => {
            // console.log('an error occurred');
            // console.log(err);
          },
          inputVerificationCode: (data: string) => {
            // console.log(data);
          }
        });
      });
  }

  onConfirmEmailFormSubmit(form: FormGroup) {
    // console.log(form);
    this.confirmEmailFormSubmitted = true;
    if (!form.invalid) {
      Auth.currentAuthenticatedUser()
        .then((currentUser: CognitoUser) => {
          currentUser.verifyAttribute('email', form.value.code, {
            onSuccess: () => {
              // console.log('success!');
              this.notifierService.notify('success', 'Email verified successfully');
              this.confirmEmailFormSubmitted = false;
              $('#confirmEmailModal').modal('hide');

              // Retrieve user's new Cognito attributes
              this.authService.currentUserInfo()
                .then(userInfo => {
                  // console.log(userInfo);
                  this.emailConfirmed = userInfo.attributes['email_verified'];
                  this.phoneConfirmed = userInfo.attributes['phone_number_verified'];
                  this.isUserDataRetrieved = true;
                });
            },
            onFailure: (err) => {
              // console.log('an error occurred');
              // console.log(err);
              this.notifierService.notify('error', err.message);
            }
          });
        })
        .catch(err => {
          // console.log('an error occurred retrieving current authenticated user');
          // console.log(err);
          this.notifierService.notify('error', err);
        });
    } else {
      // console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onConfirmPhoneFormSubmit(form: FormGroup) {
    // console.log(form);
    this.confirmPhoneFormSubmitted = true;
    if (!form.invalid) {
      Auth.currentAuthenticatedUser()
        .then((currentUser: CognitoUser) => {
          currentUser.verifyAttribute('phone_number', form.value.code, {
            onSuccess: () => {
              // console.log('success!');
              this.notifierService.notify('success', 'Phone verified successfully');
              this.confirmPhoneFormSubmitted = false;
              $('#confirmPhoneModal').modal('hide');

              // Retrieve user's new Cognito attributes
              this.authService.currentUserInfo()
                .then(userInfo => {
                  // console.log(userInfo);
                  this.emailConfirmed = userInfo.attributes['email_verified'];
                  this.phoneConfirmed = userInfo.attributes['phone_number_verified'];
                  this.isUserDataRetrieved = true;
                });
            },
            onFailure: (err) => {
              // console.log('an error occurred');
              // console.log(err);
              this.notifierService.notify('error', err.message);
            }
          });
        })
        .catch(err => {
          // console.log('an error occurred retrieving current authenticated user');
          // console.log(err);
          this.notifierService.notify('error', err);
        });
    } else {
      // console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.userLoading$.next();
    this.userLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}


