import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import Auth from '@aws-amplify/auth';
import {NotifierService} from 'angular-notifier';
import {Router} from '@angular/router';
import {AuthenticationDetails, CognitoUser} from 'amazon-cognito-identity-js';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  @Input() username: string;
  @Input() tempPassword = null;

  newPasswordModel: FormGroup = new FormGroup({
    username: new FormControl(''),
    code: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private notifierService: NotifierService,
              private router: Router,
              private auth: AuthService) {
    console.log(this.router.getCurrentNavigation().extras);
    if (this.router.getCurrentNavigation().extras.state) {
      this.username = this.router.getCurrentNavigation().extras.state.username;
      this.tempPassword = this.router.getCurrentNavigation().extras.state.tempPassword;
      this.newPasswordModel.value.username = this.username;
    }
  }

  ngOnInit() {
    if (!this.tempPassword) {
      this.router.navigate(['/login']);
    }
  }

  newPassword(form: NgForm) {
    console.log(form);
    const parentScope = this;
    if (!form.valid) {
      console.log('Invalid submission');
    } else {
      const authenticationDetails = new AuthenticationDetails({Username: this.username, Password: this.tempPassword});
      Auth.signIn(this.username, this.tempPassword)
        .then((user: CognitoUser | any) => {
          console.log(user);
          user.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
              console.log('auth success');
              // User authentication was successfull
              parentScope.notifierService.notify('success', 'New password set successfully!');
              parentScope.auth.signOut().then(() => {
                parentScope.router.navigate(['/login']);
              });
            },
            onFailure: function(err) {
              console.log('failure');
              // User authentication was not successful
            },

            mfaRequired: function(codeDeliveryDetails) {
              console.log('mfaRequired');
              // MFA is required to complete user authentication.
              // Get the code from user and call
            },

            newPasswordRequired: function(userAttributes, requiredAttributes) {
              console.log('newPasswordRequired');
              // User was signed up by an admin and must provide new
              // password and required attributes, if any, to complete
              // authentication.

              // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user.
              // Required attributes according to schema, which don’t have any values yet, will have blank values.
              // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.


              // Get these details and call
              // newPassword: password that user has given
              // attributesData: object with key as attribute name and value that the user has given.
              user.completeNewPasswordChallenge(form.value.newPasswordPassword, {}, this)
                .then(result => {
                  console.log('new password success');
                  console.log(result);
                })
                .catch(err => {
                  console.log('error');
                  console.log(err);
                });
            }
          });
        });
    }
  }

  notify(type: string) {
    this.notifierService.notify(type, 'Test');
  }

}
