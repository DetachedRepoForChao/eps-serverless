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
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
// import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {NotifierService} from 'angular-notifier';
import Auth from '@aws-amplify/auth';
import {CognitoUser} from 'amazon-cognito-identity-js';

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

  // public config: PerfectScrollbarConfigInterface = {};
  zipPattern = new RegExp(/^\d{5}(?:\d{2})?$/);
  phoneValidationError: string;
  editUserForm: FormGroup;
  editUserFormSubmitted = false;
  emailConfirmed;
  phoneConfirmed;
  isUserDataRetrieved = false;
  emailConfirmationCodeSent = false;
  email;
  phone;

  confirmEmailForm: FormGroup = new FormGroup({
    email: new FormControl({value: this.email, disabled: true}),
    code: new FormControl('', [ Validators.required, Validators.min(3) ])
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
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-spinner');

    /*      const text_max = 200;
        $('#count_message').html(text_max + ' remaining');

        $('#text').keyup(function() {
          const text_length = $('#text').val().length;
          const text_remaining = text_max - text_length;

          $('#count_message').html(text_remaining + ' remaining');
        });*/


    this.authService.currentUserInfo()
      .then(userInfo => {
        console.log(userInfo);
        this.emailConfirmed = userInfo.attributes['email_verified'];
        this.phoneConfirmed = userInfo.attributes['phone_number_verified'];
        this.isUserDataRetrieved = true;
      });

    const observables: Observable<any>[] = [];
    observables.push(
      this.currentUserService.cacheCurrentUser(),
      this.userService.cacheUsers(),
      this.achievementService.cacheAchievements()
    );
    // this.entityCurrentUserService.cacheCurrentUser().subscribe();
    // this.userService.cacheUsers().subscribe();
    // this.achievementService.cacheAchievements().subscribe();

    forkJoin(observables)
      .subscribe(() => {
        this.leaderboardUsers$ = this.userQuery.selectAll({
          filterBy: userEntity => userEntity.securityRole.Id === 1,
        });

        this.currentUser$ = this.currentUserQuery.selectAll({
          limitTo: 1
        });

        this.loadEditUserForm();
        this.populateFormData();

        this.isImageLoading = false;
        this.isCardLoading = false;
        this.spinner.hide('profile-spinner');
      });
  }

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
              this.editUserForm.patchValue({[key]: `${user['firstName']} ${user['lastName']}`});
              console.log('setting ' + key + ' to ' + user['firstName'] + ' ' + user['lastName']);
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

  onConfirmEmailClick() {
    this.authService.verifyEmail();
  }

  getPendingBalance(): Observable<any> {
    return new Observable(observer => {
      this.currentUserQuery.selectAll()
        .subscribe(user => {
          if (user[0]) {
            observer.next(user[0].pointsBalance);
            observer.complete();
          } else {
            observer.complete();
          }

        });
    });
  }

  avatarClick() {
    $('#avatarModal').modal('show');
  }

  // Creates the Edit User reactive form
  private loadEditUserForm() {
    const functionName = 'loadEditUserForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    this.editUserForm = this.formBuilder.group({
      user: [null, Validators.required],
      preferredName: [null],
      prefix: [null],
      suffix: [null],
      position: [null],
      preferredPronoun: [null],
      gender: [null],
      birthdate: [null],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required]
    });
  }


// Validates and formats the phone number by stripping out anything except number characters
  validatePhoneNumber(phone: string): (string | null) {
    console.log(phone);
    this.phoneValidationError = null;
    // Strip out all characters except numbers
    const newVal = phone.replace(/\D+/g, '');
    console.log (newVal);
    if (newVal.length === 10) {
      return newVal;
    } else {
      console.log(`Phone validation error. Phone length: ${newVal.length}`);
      this.phoneValidationError = 'The phone number must be 10 digits long.';
      return null;
    }
  }

  onEditUserFormSubmit(form: FormGroup) {
    console.log(form);
    this.editUserFormSubmitted = true;

    const sourceUser = form.controls.user.value;
    const user = {};
    const keys = Object.keys(form.controls);

    // Proceed only if the form is valid
    if (!form.invalid) {
      // Format the phone number
      const phone = `+1${this.validatePhoneNumber(form.controls.phone.value)}`;
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
            console.log('Date value changed:');
            console.log(`Old value: ${sourceUser[keys[i]]}; New value: ${dateString}`);

            user[keys[i]] = dateString;
          }
        } else if (keys[i] !== 'user') {
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // If the value has changed, add key/value pair to the user object
            console.log('Value changed:');
            console.log(form.controls[keys[i]].value);

            switch (keys[i]) {
              case 'phone': { // special case for phone
                user[keys[i]] = phone;
                break;
              }
              default: {
                user[keys[i]] = form.controls[keys[i]].value;
                break;
              }
            }
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
            this.editUserFormSubmitted = false;
            this.emailConfirmationCodeSent = true;
          });

/*        this.userService.modifyUser(user).subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.notifierService.notify('success', 'User record updated successfully.');
            this.editUserFormSubmitted = false;
          } else {
            this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
          }
        });*/

      } else {
        // User object was not changed
        console.log('There are no changes to the user object');
        this.notifierService.notify('warning', 'There were no changes made.');
        this.editUserFormSubmitted = false;
      }

      console.log(user);
      // form.controls.user.reset();
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

/*  sendEmailConfirmationCode() {
    Auth.at
  }*/

  onEmailConfirmClick() {
    this.email = this.editUserForm.controls.email.value;
  }

  sendAgain() {
    console.log(this.email);
    Auth.currentAuthenticatedUser()
      .then((currentUser: CognitoUser) => {
        currentUser.getAttributeVerificationCode('email', {
          onSuccess: () => {
            console.log('success!');
          },
          onFailure: (err) => {
            console.log('an error occurred');
            console.log(err); },
          inputVerificationCode: (data: string) => { console.log(data); }
        });
        /*currentUser.resendConfirmationCode((error, success) => {
          if (error) {
            console.log(error);
            return;
          }
          console.log(success);
        });*/
      });
    /*Auth.resendSignUp(this.email)
      .then(() => this.notifierService.notify('Success', 'A code has been emailed to you'))
      .catch((err) => {
        console.log(err);
        this.notifierService.notify('Error', 'An error occurred')
      });*/
  }

}
