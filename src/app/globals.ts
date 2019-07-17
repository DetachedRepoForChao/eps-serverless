import { Injectable } from '@angular/core';
import {Department} from './shared/department.model';
import {SecurityRole} from './shared/securityrole.model';

@Injectable()

export class Globals {

  departments: Department[];
  securityRoles: SecurityRole[];

  constructor() {}

  public localStorageItem(id: string): string {
    return localStorage.getItem(id);
  }


}
