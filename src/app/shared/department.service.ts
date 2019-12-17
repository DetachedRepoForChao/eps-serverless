import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Department} from './department.model';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {Globals} from '../globals';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  componentName = 'department.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  // private departmentList;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private globals: Globals) {
  }

  // HttpMethods
  getDepartments(): Observable<Department[]> {
    // const functionName = 'getDepartments';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Starting ${functionFullName}`);

    const departments: Department[] = this.globals.departments;
    // console.log(`${functionFullName}: check if departments have been cached`);
    if (departments.length > 0) {
      // console.log(`${functionFullName}: departments cache exists`);
      // console.log(departments);

      return new Observable<Department[]>((observer) => {
        // console.log(`${functionFullName}: returning departments from cache`);
        observer.next(departments);
        // resolve(departments);
        observer.complete();
      });
    } else {
      // console.log(`${functionFullName}: departments cache does not exist`);
      return new Observable<Department[]>( (observer) => {
        // console.log(`${functionFullName}: retrieve departments from API`);
        API.get(this.apiName, this.apiPath + '/getDepartments', {})
          .then(response => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(response);
            // console.log(`${functionFullName}: caching departments`);
            const departmentObjList: Department[] = [];
            response.data.forEach((department: any) => {
              const departmentObj: Department = {
                Id: department.id,
                Name: department.name
              };

              departmentObjList.push(departmentObj);
            });

            this.globals.departments = departmentObjList;

            // console.log(`${functionFullName}: returning departments from API`);
            // resolve(departmentObjList);
            observer.next(departmentObjList);
            observer.complete();
          })
          .catch(err => {
            // console.log(`${functionFullName}: HTTP error`);
            // console.log(err);
            observer.error(err);
            observer.complete();
          });
      });
    }
  }

  getDepartmentById(departmentId: number): Observable<Department> {
    // const functionName = 'getDepartmentById';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Starting ${functionFullName}`);

    const departments: Department[] = this.globals.departments;
    // console.log(`${functionFullName}: check if departments have been cached`);
    if (departments.length > 0) {
      // console.log(`${functionFullName}: departments cache exists`);
      // console.log(departments);

      // console.log(`${functionFullName}: retrieve department id ${departmentId} from cache`);

      const department = departments.find(x => x.Id === departmentId);
      // console.log(department);

      return new Observable<Department>(observer => {
        // console.log(`${functionFullName}: returning department id ${departmentId} from cache`);
        observer.next(department);
        observer.complete();
      });
    } else {
      // console.log(`${functionFullName}: departments cache does not exist`);
      return new Observable<Department>( observer => {
        // console.log(`${functionFullName}: retrieve department id ${departmentId} from API`);

        const myInit = this.myInit;
        myInit['body'] = {departmentId: departmentId};
        API.post(this.apiName, this.apiPath + '/getDepartments', this.myInit).then(data => {
          // console.log(`${functionFullName}: successfully retrieved data from API`);
          // console.log(data);

          const departmentObj: Department = {
            Id: data.data.id,
            Name: data.data.name
          };

          // console.log(`${functionFullName}: returning department id ${departmentId} from API`);
          observer.next(departmentObj);
          observer.complete();
        });
      });
    }
  }

  getEmployeesByDepartmentId(departmentId: number): Observable<any> {
    // const functionName = 'getEmployeesByDepartmentId';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Starting ${functionFullName}`);

    // const user = await this.authService.currentAuthenticatedUser();
    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;
          myInit['body'] = {departmentId: departmentId};

          API.post(this.apiName, this.apiPath + '/getEmployeesByDepartmentId', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
            observer.next(data.data);
          });
        });
    });

  }
}
