import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';
import Amplify, {API} from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class SecurityRoleService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  // HttpMethods

/*  getSecurityRoles() {
    console.log('getSecurityRoles');
    //console.log(this.http.get(environment.apiBaseUrl + '/getSecurityRoles'));
    return this.http.get(environment.apiBaseUrl + '/getSecurityRoles', this.noAuthHeader);
  }*/

  getSecurityRoles() {
    console.log('getSecurityRoles');

    return API.get('api9819f38d', '/items/getSecurityRoles', {}).then(data => {
      console.log('serverless security roles api');
      console.log(data);
      return data.data;
    });
  }

  getSecurityRoleById(securityRoleId: number) {
    console.log('getSecurityRoleById');
    console.log('securityRoleService.getSecurityRoleById: ' + securityRoleId);
    return this.http.post(environment.apiBaseUrl + '/getSecurityRoles', {securityRoleId: securityRoleId}, this.noAuthHeader);
  }
}
