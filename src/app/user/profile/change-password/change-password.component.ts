import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {forkJoin, Observable, pipe} from 'rxjs';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {HttpClient} from '@angular/common/http';

import {Globals} from '../../../globals';

import {NgxSpinnerService} from 'ngx-spinner';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';

import {CurrentUserStore} from '../../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {UserHasStoreItemQuery} from '../../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {MetricsService} from '../../../entity-store/metrics/state/metrics.service';
import {AuthService} from '../../../login/auth.service';
import {FeatureService} from '../../../entity-store/feature/state/feature.service';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
// import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {NotifierService} from 'angular-notifier';
import Auth from '@aws-amplify/auth';
import {CognitoUser, CognitoUserAttribute} from 'amazon-cognito-identity-js';
import {tap} from 'rxjs/operators';


declare var $: any;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  componentName = 'change-password.component';
  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;

  currentUser$;
  isCardLoading: boolean;

  changePasswordForm: FormGroup;
  changePasswordFormSubmitted = false;

  getResetCodeSubmitted = false;
  resetCodeSent = false;
  resetPasswordForm: FormGroup;
  resetPasswordFormSubmitted = false;
  emailConfirmed;
  phoneConfirmed;
  email;
  phone;
  isUserDataRetrieved = false;

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
    this.spinner.show('change-password-spinner');

    this.authService.currentUserInfo()
      .then(userInfo => {
        console.log(userInfo);
        this.emailConfirmed = userInfo.attributes['email_verified'];
        this.phoneConfirmed = userInfo.attributes['phone_number_verified'];
        this.email = userInfo.attributes['email'];
        this.phone = userInfo.attributes['phone_number'];
        this.isUserDataRetrieved = true;
      });

    this.loadChangePasswordForm();
    this.loadResetPasswordForm();

    this.leaderboardUsers$ = this.userQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.currentUser$ = this.currentUserQuery.selectAll({
      limitTo: 1
    });

    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('change-password-spinner');
  }

/*
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
*/

  avatarClick() {
    $('#avatarModal').modal('show');
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      const password = group.controls[passwordKey];
      const confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    };
  }

  private loadChangePasswordForm() {
    const functionName = 'loadChangePasswordForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern(/^[\S]+.*[\S]+$/)])],
      newPassword: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern(/^[\S]+.*[\S]+$/)])],
      confirmPassword: [null, Validators.required],
    }, {validators: this.matchingPasswords('newPassword', 'confirmPassword')});
  }

  private loadResetPasswordForm() {
    const functionName = 'loadResetPasswordForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    this.resetPasswordForm = this.formBuilder.group({
      resetCode: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      newPassword: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern(/^[\S]+.*[\S]+$/)])],
      confirmPassword: [null, Validators.required],
    }, {validators: this.matchingPasswords('newPassword', 'confirmPassword')});
  }

  onGetResetCodeSubmit() {
    this.getResetCodeSubmitted = true;
    Auth.currentUserInfo()
      .then((userInfo: any) => {
        console.log(userInfo);
        const username = userInfo['username'];

        Auth.forgotPassword(username)
          .then((data: any) => {
            console.log(data);
            this.resetCodeSent = true;
            $('#getResetCodeModal').modal('hide');
            $('#resetPasswordModal').modal('show');
            this.getResetCodeSubmitted = false;
            this.notifierService.notify('success', 'Reset code sent successfully.');
          })
          .catch(err => {
            console.log('An error occurred');
            console.log(err);
            this.notifierService.notify('error', err.message);
          });
      });
  }

  sendResetCodeAgain() {
    Auth.currentUserInfo()
      .then((userInfo: any) => {
        const username = userInfo['username'];
        Auth.forgotPassword(username)
          .then(() => this.notifierService.notify('success', 'Reset code sent successfully.'))
          .catch(() => this.notifierService.notify('error', 'An error occurred'));
      });
  }

  alreadyHaveCodeClick() {
    this.resetCodeSent = true;
    $('#getResetCodeModal').modal('hide');
    $('#resetPasswordModal').modal('show');
  }

  onResetPasswordFormSubmit(form: FormGroup) {
    this.resetPasswordFormSubmitted = true;
    console.log(form);
    if (!form.invalid) {
      Auth.currentUserInfo()
        .then((userInfo: any) => {
          const username = userInfo['username'];

          Auth.forgotPasswordSubmit(username, form.controls.resetCode.value, form.controls.newPassword.value)
            .then(() => {
              this.resetPasswordFormSubmitted = false;
              form.reset();
              $('#resetPasswordModal').modal('hide');
              this.notifierService.notify('success', 'Password reset successful!');
            })
            .catch(err => {
              console.log('An error occurred');
              console.log(err);
              this.notifierService.notify('error', err.message);
            });
        });
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onChangePasswordFormSubmit(form: FormGroup) {
    console.log(form);
    this.changePasswordFormSubmitted = true;

    // Proceed only if the form is valid
    if (!form.invalid) {

      this.authService.changePassword(form.controls.currentPassword.value, form.controls.newPassword.value)
        .then(result => {
          console.log('password change success:');
          console.log(result);
          this.changePasswordFormSubmitted = false;
          form.reset();
          this.notifierService.notify('success', 'Password changed successfully!');
        })
        .catch(err => {
          console.log('password change error:');
          console.log(err);
          if (err.message === 'Incorrect username or password') {
            this.notifierService.notify('error', 'Incorrect password. Please try again.');
          } else {
            this.notifierService.notify('error', 'An error occurred.');
          }
        });
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  test() {
    this.authService.test();
  }
}


