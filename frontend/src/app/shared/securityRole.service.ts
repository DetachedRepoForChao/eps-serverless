import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';

@Injectable({
  providedIn: 'root'
})
export class SecurityRoleService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

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

    return API.get(this.apiName, this.apiPath + '/getSecurityRoles', {}).then(data => {
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
