import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  componentName = 'user.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  departments: Department[];
  securityRoles: SecurityRole[];

  selectedUser: User = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    securityRole: null,
    department: null,
    points: 0,
    password: '',
    phone: '',
    birthdate: ''
  };

  constructor(private http: HttpClient, private authService: AuthService) {
    // this.departments = this.getDepartments();
  }

  // HttpMethods

  postUser(user: User): Observable<any> {
    const functionName = 'postUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(user);
    const myInit = this.myInit;
    myInit['body'] = user;
    console.log(myInit);
    return new Observable<any>(observer => {
      API.post(this.apiName, this.apiPath + '/registerUser', myInit).then(data => {
        console.log(`${functionFullName}: Request submitted successfully`);
        console.log(data);
        observer.next(data.data);
        observer.complete();
      });
    });


    // return this.http.post(environment.apiBaseUrl + '/registerUser', user, this.noAuthHeader);
  }

/*  login(authCredentials) {
    const functionName = 'login';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(authCredentials);
    return this.http.post(environment.apiBaseUrl + '/authenticateUser', authCredentials, this.noAuthHeader);
  }*/

  getUserProfile(): Observable<any> {
    const functionName = 'getUserProfile';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/userProfile', myInit).then(data => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

/*  setUserProfile() {
    // return this.http.get(environment.apiBaseUrl + '/userProfile');
    console.log('getUserProfile');
    // console.log(this.http.get(environment.apiBaseUrl + '/userProfileGet'));
    return this.http.get(environment.apiBaseUrl + '/userProfileGet');
  }*/


  async getUserPoints(): Promise<any> {
    const functionName = 'getUserPoints';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;

    return new Promise<any>(resolve => {
      API.get(this.apiName, this.apiPath + '/getUserPoints', myInit).then(data => {
        console.log(`${functionFullName}: retrieved data from API`);
        console.log(data);
        // return data.data;
        resolve(data.data);
      });
    });
  }

  // Helper Methods

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  deleteToken() {
    localStorage.removeItem('token');
  }

  async getUserPayload() {
    const functionName = 'getUserPayload';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;

    if (token) {
      console.log(`${functionFullName}: token exists`);
      console.log(token);
      const userPayload = atob(token.split('.')[1]);
      return JSON.parse(userPayload);
    } else {
      console.warn(`${functionFullName}: no token`);
      return null;
    }
  }


  isLoggedIn() {
    const functionName = 'isLoggedIn';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return this.getUserPayload()
      .then(userPayload => {
        if (userPayload) {
          console.log(`${functionFullName}: user logged in`);
          return userPayload.exp > Date.now() / 1000;
        } else {
          console.warn(`${functionFullName}: user not logged in`);
          return false;
        }
      });
  }
}
