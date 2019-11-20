import { Injectable } from '@angular/core';
import {Department} from './shared/department.model';
import {SecurityRole} from './shared/securityrole.model';
import {UserAvatarRelationship} from './shared/avatar/avatar.service';

@Injectable()

export class Globals {

  departments: Department[] = [];
  securityRoles: SecurityRole[] = [];
  userDetails: any = null;

  constructor() {}

  public localStorageItem(id: string): string {
    return localStorage.getItem(id);
  }

  public getUserAttributes() {
    const localStorageItems = [];
    for ( let i = 0; i < localStorage.length; i++) {
      localStorageItems.push(localStorage.key(i));
    }

    const userDataKey = localStorageItems.find((x: string) => x.includes('userData') === true);
    const userDataValue = localStorage.getItem(userDataKey);
    return JSON.parse(userDataValue);
  }

  public getUserAttribute(userAttribute: string): string {
    const userData = this.getUserAttributes();
    if (userData.UserAttributes.find(x => x.Name === userAttribute)) {
      return userData.UserAttributes.find(x => x.Name === userAttribute).Value;
    } else {
      return null;
    }
  }

  public getUsername(): string {
    const userData = this.getUserAttributes();
    return userData.Username;
  }

}
