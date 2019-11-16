import {Injectable, OnInit} from '@angular/core';
import Auth, { CognitoHostedUIIdentityProvider,  } from '@aws-amplify/auth';
import { Hub, ICredentials, } from '@aws-amplify/core';
import { Subject, Observable } from 'rxjs';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import {Globals} from '../globals';
import {Router} from '@angular/router';

export interface NewUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  profile: any;
  picture: string;
  name: string;
  middleName: string;
  phone: string;
  birthdate: string;
  department: string;
  departmentId: string;
  securityRole: string;
  securityRoleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: boolean;
  private _authState: Subject<CognitoUser | any> = new Subject<CognitoUser | any>();
  authState: Observable<CognitoUser | any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut';
  public static FACEBOOK = CognitoHostedUIIdentityProvider.Facebook;
  public static GOOGLE = CognitoHostedUIIdentityProvider.Google;


  constructor(private globals: Globals, private router: Router) {
    Hub.listen('auth', (data) => {
      const {channel, payload} = data;
      if (channel === 'auth') {
        this._authState.next(payload.event);
      }
    });
  }

  signUp(user: NewUser): Promise<CognitoUser | any> {
    console.log('NewUser');
    console.log(user);
    return Auth.signUp({
      'username': user.username,
      'password': user.password,
      'attributes': {
        'email': user.email,
        'given_name': user.firstName,
        'family_name': user.lastName,
        'middle_name': user.middleName,
        'gender': user.gender,
        'profile': user.profile,
        'picture': user.picture,
        'name': user.name,
        'birthdate': user.birthdate,
        'phone_number': user.phone,
        'custom:department': user.department,
        'custom:department_id': `${user.departmentId}`,
        'custom:security_role': user.securityRole,
        'custom:security_role_id': `${user.securityRoleId}`
      }
    });
  }



  signIn(username: string, password: string): Promise<CognitoUser | any> {
    return new Promise((resolve, reject) => {
      Auth.signIn(username, password)
        .then((user: CognitoUser | any) => {
          console.log(user);
          if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
            console.log('new password required');
            resolve({user: user, status: user.challengeName});
          } else {
            this.loggedIn = true;
            resolve({user: user, status: user.challengeName});
          }

        }).catch((error: any) => {

          reject(error);
      });
    });
  }

  signOut(): Promise<any> {
    return Auth.signOut()
      .then(() => this.loggedIn = false);
  }

  currentAuthenticatedUser(): Promise<any> {
    return Auth.currentAuthenticatedUser();
  }

  currentUserInfo(): Promise<any> {
    return Auth.currentUserInfo();
  }

  verifyEmail() {
    console.log('verify email');
    Auth.currentAuthenticatedUser()
      .then(cognitoUser => {
        cognitoUser.getAttributeVerificationCode('email', {
          onSuccess: () => {
            console.log('success');
          },
          onFailure: (err) => {
            console.log(err);
          },
          inputVerificationCode: () => {
            console.log('verifying email');
            const verificationCode = prompt('Please input verification code: ', '');
            cognitoUser.verifyAttribute('email', verificationCode, {
              onSuccess: (success) => {
                console.log('success: ' + success);
              },
              onFailure: (err) => {
                console.log('error');
                console.log(err);
              }
            });
          }
        });
      });
  }

  changePassword(oldPassword: string, newPassword: string): Promise<any> {
    console.log('change password');
    return new Promise<any>((resolve, reject) => {
      Auth.currentAuthenticatedUser()
        .then((cognitoUser: CognitoUser) => {
          cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
            if (err) {
              console.log('error');
              console.log(err);
              reject(err);
              return;
            }
            console.log('success');
            console.log(result);
            resolve(result);
          });
        });
    });
  }

  test(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Auth.currentAuthenticatedUser()
        .then((currentUser: CognitoUser) => {
          const attributeList = [];
          attributeList.push({
            Name: 'email_verified',
            Value: 'false',
          });
          attributeList.push({
            Name: 'phone_number_verified',
            Value: 'false',
          });
          currentUser.updateAttributes(attributeList, function(err, result) {
            if (err) {
              console.log(err);
              reject(err);
              return;
            }
            console.log('call result: ' + result);
            resolve(result);
          });
        });
    });
  }
}
