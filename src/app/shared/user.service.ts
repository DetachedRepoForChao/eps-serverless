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


  postUser(user: User): Observable<any> {
    // const functionName = 'postUser';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(user);
    const myInit = this.myInit;
    myInit['body'] = user;
    // console.log(myInit);
    return new Observable<any>(observer => {
      API.post(this.apiName, this.apiPath + '/registerUser', myInit).then(data => {
        // console.log(`${functionFullName}: Request submitted successfully`);
        // console.log(data);
        observer.next(data.data);
        observer.complete();
      });
    });


    // return this.http.post(environment.apiBaseUrl + '/registerUser', user, this.noAuthHeader);
  }


}
