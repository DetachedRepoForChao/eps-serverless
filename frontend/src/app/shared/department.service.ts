import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';
import {GlobalVariableService} from './global-variable.service';
import {forEach} from '@angular/router/src/utils/collection';
import Amplify, {API} from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  //departments: Department[];

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService,
              ) {

  }

  // HttpMethods

/*  getDepartments() {
    console.log('getDepartments');
    //console.log(this.http.get(environment.apiBaseUrl + '/getDepartments'));
    return this.http.get(environment.apiBaseUrl + '/getDepartments');
    //  .subscribe(departments => {
     //   console.log('getDepartments()');
      //  console.log(departments);
      //  return departments;
     // });
    // return this.http.get(environment.apiBaseUrl + '/getDepartments', this.noAuthHeader);
  }*/

  getDepartments() {
    console.log('getDepartments');

    return API.get('api9819f38d', '/items/getDepartments', {}).then(data => {
      console.log('serverless departments api');
      console.log(data);
      return data.data;
    });
    // API.get('sampleCloudApi', '/items', {}).then(data => {
    //   this.loading = false;
    //   this.todos = data;
    // });
    //console.log(this.http.get(environment.apiBaseUrl + '/getDepartments'));
    // return this.http.get(environment.apiBaseUrl + '/getDepartments');
    //  .subscribe(departments => {
    //   console.log('getDepartments()');
    //  console.log(departments);
    //  return departments;
    // });
    // return this.http.get(environment.apiBaseUrl + '/getDepartments', this.noAuthHeader);
  }

  storeDepartments() {
    // this.getDepartments()
    //   .subscribe((result: any) => {
    //     const departmentObjList: Department[] = [];
    //     result.departments.forEach(department => {
    //       const departmentObj: Department = {
    //         Id: department.id,
    //         Name: department.name
    //       };
    //
    //       departmentObjList.push(departmentObj);
    //     });
    //
    //     this.globalVariableService.setDepartmentList(departmentObjList);
    //     });

    this.getDepartments()
      .then((result: any) => {
        const departmentObjList: Department[] = [];
        result.departments.forEach(department => {
          const departmentObj: Department = {
            Id: department.id,
            Name: department.name
          };

          departmentObjList.push(departmentObj);
        });

        this.globalVariableService.setDepartmentList(departmentObjList);
      });
  }
  
  getDepartmentById(departmentId: number) {
    console.log('departmentService.getDepartmentById: ' + departmentId);
    return this.http.post(environment.apiBaseUrl + '/getDepartments', {departmentId: departmentId});
  }

  getEmployeesByDepartmentId(departmentId: number) {
    console.log('getEmployeesByDepartmentId');
    return this.http.post(environment.apiBaseUrl + '/getEmployeesByDepartmentId', {departmentId: departmentId});
  }

}
