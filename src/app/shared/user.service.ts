import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from "../login/auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  componentName = 'user.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  departments: Department[];
  securityRoles: SecurityRole[];

  selectedUser: User = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    securityRole: '',
    department: '',
    points: 0,
    password: ''
  };

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient, private authService: AuthService) {
    // this.departments = this.getDepartments();
  }

  // HttpMethods

  postUser(user: User) {
    const functionName = 'postUser';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(user);
    this.myInit['body'] = user;
    console.log(this.myInit);
    return API.post(this.apiName, this.apiPath + '/registerUser', this.myInit).then(data => {
      console.log('serverless user api');
      console.log(data);
      return data.data;
    });

    // return this.http.post(environment.apiBaseUrl + '/registerUser', user, this.noAuthHeader);
  }

  login(authCredentials) {
    const functionName = 'login';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(authCredentials);
    return this.http.post(environment.apiBaseUrl + '/authenticateUser', authCredentials, this.noAuthHeader);
  }

  async getUserProfile(): Promise<any> {
    const functionName = 'getUserProfile';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;
    console.log(myInit);

    // return this.authService.currentAuthenticatedUser().then(data => {
      // console.log(data);
    return new Promise<any>(resolve => {
      API.get(this.apiName, this.apiPath + '/userProfile', myInit).then(data => {
        console.log(`${functionFullName}: data retrieved from API`);
        console.log(data);
        // return data.data;
        resolve(data.data);
      });
    });
  }

  setUserProfile() {
    // return this.http.get(environment.apiBaseUrl + '/userProfile');
    console.log('getUserProfile');
    // console.log(this.http.get(environment.apiBaseUrl + '/userProfileGet'));
    return this.http.get(environment.apiBaseUrl + '/userProfileGet');
  }


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
