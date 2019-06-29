import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

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

  constructor(private http: HttpClient) {
    // this.departments = this.getDepartments();
  }



  // HttpMethods

  getDepartments() {
    // console.log(this.http.get(environment.apiBaseUrl + '/getDepartments'));
    console.log('getDepartments');
    return this.http.get(environment.apiBaseUrl + '/getDepartments');
  }

  getSecurityRoles() {
    return this.http.get(environment.apiBaseUrl + '/getSecurityRoles', this.noAuthHeader);
  }

  postUser(user: User) {
    // return this.http.post(environment.apiBaseUrl+'/register',login,this.noAuthHeader);
    console.log(user);
    return this.http.post(environment.apiBaseUrl + '/registerUser', user, this.noAuthHeader);
  }

  login(authCredentials) {
    // return this.http.post(environment.apiBaseUrl + '/authenticate', authCredentials,this.noAuthHeader);
    console.log('login authCredentials');
    console.log(authCredentials);
    return this.http.post(environment.apiBaseUrl + '/authenticateUser', authCredentials, this.noAuthHeader);
  }

  getUserProfile() {
    // return this.http.get(environment.apiBaseUrl + '/userProfile');
    console.log('userProfile');
    // console.log(this.http.get(environment.apiBaseUrl + '/userProfileGet'));
    return this.http.get(environment.apiBaseUrl + '/userProfile');
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
