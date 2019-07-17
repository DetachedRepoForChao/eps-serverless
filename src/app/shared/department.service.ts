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

  // departments: Department[];

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
    console.log('Starting department.service getDepartments');

    const departments: Department[] = this.globals.departments;
    console.log('department.service getDepartments: check if departments have been cached');
    if (departments) {
      console.log('department.service getDepartments: departments cache exists');
      console.log(departments);

      return new Promise(resolve => {
        console.log('department.service getDepartments: returning departments from cache');
        resolve(departments);
      });
    } else {
      console.log('department.service getDepartments: departments cache does not exist');
      return new Promise( resolve => {
        console.log('department.service getDepartments: retrieve departments from API');
        API.get(this.apiName, this.apiPath + '/getDepartments', {}).then(data => {
          console.log('department.service getDepartments: successfully retrieved data from API');
          console.log(data);
          console.log('department.service getDepartments: caching departments');
          const departmentObjList: Department[] = [];
          data.data.forEach((department: any) => {
            const departmentObj: Department = {
              Id: department.id,
              Name: department.name
            };

            departmentObjList.push(departmentObj);
          });

          this.globals.departments = departmentObjList;

          console.log('department.service getDepartments: returning departments from API');
          resolve(departmentObjList);
        });
      });

    }

/*    const cachedDepartments = this.globalVariableService.departmentList;
    return cachedDepartments.subscribe(departments => {
      if (departments.length > 0) {
        console.log('cached departments exists');
        console.log(departments);
        // return departments;
      } else {
        console.log('cached list of departments does not exists. retrieving via API call');
        API.get(this.apiName, this.apiPath + '/getDepartments', {}).then(data => {
          console.log('serverless departments api');
          console.log(data);
          console.log('caching list of departments');
          const departmentObjList: Department[] = [];
          data.data.forEach(department => {
            const departmentObj: Department = {
              Id: department.id,
              Name: department.name
            };

            departmentObjList.push(departmentObj);
          });
          console.log('settings global variable: departmentList');
          this.globalVariableService.setDepartmentList(departmentObjList);
          // return departmentObjList;
        });
      }
    });*/


    // console.log(awsconfig);
/*    return API.get(this.apiName, this.apiPath + '/getDepartments', {}).then(data => {
      console.log('serverless departments api');
      console.log(data);
      return data.data;
    });*/
  }

/*  storeDepartments() {
    console.log('storeDepartments');
    this.getDepartments()
      .then((result: any) => {
        console.log('departments:');
        console.log(result);
        const departmentObjList: Department[] = [];
        result.forEach(department => {
          const departmentObj: Department = {
            Id: department.id,
            Name: department.name
          };

          departmentObjList.push(departmentObj);
        });

        this.globalVariableService.setDepartmentList(departmentObjList);
      });
  }*/
  
  getDepartmentById(departmentId: number) {
    console.log('departmentService.getDepartmentById: ' + departmentId);
    // return this.http.post(environment.apiBaseUrl + '/getDepartments', {departmentId: departmentId});
    this.myInit['body'] = {departmentId: departmentId};
    return API.post(this.apiName, this.apiPath + '/getDepartments', this.myInit).then(data => {
      console.log('serverless departments api');
      console.log(data);
      return data.data;
    });
  }

  async getEmployeesByDepartmentId(departmentId: number) {
    console.log('getEmployeesByDepartmentId');

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;
    this.myInit['body'] = {departmentId: departmentId};

    return API.post(this.apiName, this.apiPath + '/getEmployeesByDepartmentId', this.myInit).then(data => {
      console.log('serverless getEmployeesByDepartmentId');
      console.log(data);
      return data.data;
    });

    // return this.http.post(environment.apiBaseUrl + '/getEmployeesByDepartmentId', {departmentId: departmentId});
  }

}
