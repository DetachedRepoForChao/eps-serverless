import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';
import {GlobalVariableService} from './global-variable.service';
import {forEach} from '@angular/router/src/utils/collection';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {Globals} from '../globals';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  componentName = 'department.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  // private departmentList;

  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService,
              private authService: AuthService,
              private globals: Globals) {
  }

  // HttpMethods
  getDepartments(): Promise<Department[]> {
    const functionName = 'getDepartments';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Starting ${functionFullName}`);

    const departments: Department[] = this.globals.departments;
    console.log(`${functionFullName}: check if departments have been cached`);
    if (departments) {
      console.log(`${functionFullName}: departments cache exists`);
      console.log(departments);

      return new Promise(resolve => {
        console.log(`${functionFullName}: returning departments from cache`);
        resolve(departments);
      });
    } else {
      console.log(`${functionFullName}: departments cache does not exist`);
      return new Promise( resolve => {
        console.log(`${functionFullName}: retrieve departments from API`);
        API.get(this.apiName, this.apiPath + '/getDepartments', {}).then(data => {
          console.log(`${functionFullName}: successfully retrieved data from API`);
          console.log(data);
          console.log(`${functionFullName}: caching departments`);
          const departmentObjList: Department[] = [];
          data.data.forEach((department: any) => {
            const departmentObj: Department = {
              Id: department.id,
              Name: department.name
            };

            departmentObjList.push(departmentObj);
          });

          this.globals.departments = departmentObjList;

          console.log(`${functionFullName}: returning departments from API`);
          resolve(departmentObjList);
        });
      });
    }
  }

  
/*  getDepartmentById(departmentId: number) {
    const functionName = 'getDepartmentById';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Starting ${functionFullName}`);

    console.log('departmentService.getDepartmentById: ' + departmentId);
    // return this.http.post(environment.apiBaseUrl + '/getDepartments', {departmentId: departmentId});
    this.myInit['body'] = {departmentId: departmentId};
    return API.post(this.apiName, this.apiPath + '/getDepartments', this.myInit).then(data => {
      console.log('serverless departments api');
      console.log(data);
      return data.data;
    });
  }*/

  getDepartmentById(departmentId: number): Promise<Department> {
    const functionName = 'getDepartmentById';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Starting ${functionFullName}`);

    const departments: Department[] = this.globals.departments;
    console.log('department.service getDepartments: check if departments have been cached');
    if (departments) {
      console.log('department.service getDepartments: departments cache exists');
      // console.log(departments);

      console.log(`${functionFullName}: retrieve department id ${departmentId} from cache`);

      const department = departments.find(x => x.Id === departmentId);
      console.log(department);

      return new Promise(resolve => {
        console.log(`${functionFullName}: returning department id ${departmentId} from cache`);
        resolve(department);
      });
    } else {
      console.log(`${functionFullName}: departments cache does not exist`);
      return new Promise( resolve => {
        console.log(`${functionFullName}: retrieve department id ${departmentId} from API`);

        const myInit = this.myInit;
        myInit['body'] = {departmentId: departmentId};
        API.post(this.apiName, this.apiPath + '/getDepartments', this.myInit).then(data => {
          console.log(`${functionFullName}: successfully retrieved data from API`);
          console.log(data);

          const departmentObj: Department = {
            Id: data.data.id,
            Name: data.data.name
          };

          console.log(`${functionFullName}: returning department id ${departmentId} from API`);
          resolve(departmentObj);
        });
      });
    }
  }

  async getEmployeesByDepartmentId(departmentId: number): Promise<any> {
    const functionName = 'getEmployeesByDepartmentId';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Starting ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;
    myInit['body'] = {departmentId: departmentId};

    API.post(this.apiName, this.apiPath + '/getEmployeesByDepartmentId', myInit).then(data => {
      console.log(`${functionFullName}: successfully retrieved data from API`);
      console.log(data);
      return new Promise(resolve => {
        resolve(data.data);
      });
    });

    // return this.http.post(environment.apiBaseUrl + '/getEmployeesByDepartmentId', {departmentId: departmentId});
  }

}
