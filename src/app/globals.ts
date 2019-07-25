import { Injectable } from '@angular/core';
import {Department} from './shared/department.model';
import {SecurityRole} from './shared/securityrole.model';

@Injectable()

export class Globals {

  departments: Department[] = [];
  securityRoles: SecurityRole[] = [];
  cognitoUserId: string = null;

  constructor() {}

  public localStorageItem(id: string): string {
    return localStorage.getItem(id);
  }


}
