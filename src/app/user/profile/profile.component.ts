import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
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
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
// import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {NotifierService} from 'angular-notifier';

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
  currentUser;
  isCardLoading: boolean;

  // public config: PerfectScrollbarConfigInterface = {};
  zipPattern = new RegExp(/^\d{5}(?:\d{2})?$/);
  phoneValidationError: string;
  editUserForm: FormGroup;
  editUserFormSubmitted = false;

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private globals: Globals,
              private leaderboardService: LeaderboardService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private currentUserStore: CurrentUserStore,
              public currentUserQuery: EntityCurrentUserQuery,
              private entityCurrentUserService: EntityCurrentUserService,
              private sanitizer: DomSanitizer,
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
    this.spinner.show('profile-card-spinner');

    /*      const text_max = 200;
        $('#count_message').html(text_max + ' remaining');

        $('#text').keyup(function() {
          const text_length = $('#text').val().length;
          const text_remaining = text_max - text_length;

          $('#count_message').html(text_remaining + ' remaining');
        });*/



    this.userService.cacheUsers().subscribe();

    this.leaderboardUsers$ = this.userQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.currentUser$ = this.currentUserQuery.selectAll({
      limitTo: 1
    });
    // load reactive forms
    this.loadEditUserForm();

    this.currentUser$.subscribe(currentUser => {
      const user = currentUser[0];
      console.log(user);

      const keys = Object.keys(user);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (this.editUserForm.get(key)) {
          // We must take special consideration for selection objects like securityRole and department
          switch (key) {
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

    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('profile-card-spinner');
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
    this.editUserForm = this.formBuilder.group({
      user: [null, Validators.required],
      preferredName: [null],
      prefix: [null],
      suffix: [null],
      position: [null],
      preferredPronoun: [null],
      sex: [null],
      gender: [null],
      dateOfHire: [null],
      address1: [null],
      address2: [null],
      city: [null],
      state: [null],
      country: [null],
      zip: [null, Validators.compose([Validators.pattern(this.zipPattern)])],
      birthdate: [null, Validators.required],
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
        if ((keys[i] === 'securityRole') || (keys[i] === 'department')) {
          console.log(keys[i]);
          // Special consideration for nested objects like securityRole and department
          if (sourceUser[keys[i]].Id === form.controls[keys[i]].value.Id) {
            // No change
          } else {
            console.log('Value changed:');
            console.log(form.controls[keys[i]].value);
            switch (keys[i]) { // we need to account for securityRole and department objects
              case 'securityRole': {
                user['securityRoleId'] = form.controls[keys[i]].value.Id;
                user['securityRoleName'] = form.controls[keys[i]].value.Name;
                break;
              }
              case 'department': {
                user['departmentId'] = form.controls[keys[i]].value.Id;
                user['departmentName'] = form.controls[keys[i]].value.Name;
                break;
              }
            }
          }
        } else if ((keys[i] === 'birthdate') || (keys[i] === 'dateOfHire')) {
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
        this.userService.modifyUser(user).subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.notifierService.notify('success', 'User record updated successfully.');
            this.editUserFormSubmitted = false;
          } else {
            this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
          }
        });

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
}
