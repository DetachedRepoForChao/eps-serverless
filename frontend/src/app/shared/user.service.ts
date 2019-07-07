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

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    },
    body: null
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
    // return this.http.post(environment.apiBaseUrl+'/register',login,this.noAuthHeader);
    console.log(user);
    this.myInit.body = user;
    console.log(this.myInit);
    return API.post(this.apiName, this.apiPath + '/registerUser', this.myInit).then(data => {
      console.log('serverless user api');
      console.log(data);
      return data.data;
    });

    // return this.http.post(environment.apiBaseUrl + '/registerUser', user, this.noAuthHeader);
  }

  login(authCredentials) {
    // return this.http.post(environment.apiBaseUrl + '/authenticate', authCredentials,this.noAuthHeader);
    console.log('login authCredentials');
    console.log(authCredentials);
    return this.http.post(environment.apiBaseUrl + '/authenticateUser', authCredentials, this.noAuthHeader);
  }

  async getUserProfile() {
    // return this.http.get(environment.apiBaseUrl + '/userProfile');
    console.log('userProfile');
    // console.log(this.http.get(environment.apiBaseUrl + '/userProfileGet'));
    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;
    console.log(this.myInit);

    return this.authService.currentAuthenticatedUser().then(data => {
      // console.log(data);
      return API.get(this.apiName, this.apiPath + '/userProfile', this.myInit).then(data => {
        console.log('serverless get userProfile');
        console.log(data);
        return data.data;
      });
    });

    // return this.http.get(environment.apiBaseUrl + '/userProfile');
  }

  setUserProfile() {
    // return this.http.get(environment.apiBaseUrl + '/userProfile');
    console.log('getUserProfile');
    // console.log(this.http.get(environment.apiBaseUrl + '/userProfileGet'));
    return this.http.get(environment.apiBaseUrl + '/userProfileGet');
  }


  getUserRole() {
    // return this.http.get(environment.apiBaseUrl + '/userProfile');
    return this.http.get(environment.apiBaseUrl + '/userRoleGet');
  }

  getUserPoints() {
    console.log('getUserPoints');
    return this.http.get(environment.apiBaseUrl + '/getUserPoints');
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

  getUserPayload() {
    console.log('getUserPayload');
    const token = this.getToken();
    if (token) {
      const userPayload = atob(token.split('.')[1]);
      return JSON.parse(userPayload);
    } else {
      return null;
    }
  }


  isLoggedIn() {
    const userPayload = this.getUserPayload();
    if (userPayload) {
      return userPayload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }
}
