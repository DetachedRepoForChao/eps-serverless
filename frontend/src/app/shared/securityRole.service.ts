import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import {Department} from './department.model';

@Injectable({
  providedIn: 'root'
})
export class SecurityRoleService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  // HttpMethods

  getSecurityRoles() {
    console.log('getSecurityRoles');
    //console.log(this.http.get(environment.apiBaseUrl + '/getSecurityRoles'));
    return this.http.get(environment.apiBaseUrl + '/getSecurityRoles', this.noAuthHeader);
  }

  getSecurityRoleById(securityRoleId: number) {
    console.log('getSecurityRoleById');
    console.log('securityRoleService.getSecurityRoleById: ' + securityRoleId);
    return this.http.post(environment.apiBaseUrl + '/getSecurityRoles', {securityRoleId: securityRoleId}, this.noAuthHeader);
  }
}
