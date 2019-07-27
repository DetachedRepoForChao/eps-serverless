import { Injectable } from '@angular/core';
import {Department} from './shared/department.model';
import {SecurityRole} from './shared/securityrole.model';
import {UserAvatarRelationship} from './shared/avatar.service';

@Injectable()

export class Globals {

  departments: Department[] = [];
  securityRoles: SecurityRole[] = [];
  userAvatarHash: UserAvatarRelationship[] = [];

  cognitoUserId: string = null;

  constructor() {}

  public localStorageItem(id: string): string {
    return localStorage.getItem(id);
  }


}
