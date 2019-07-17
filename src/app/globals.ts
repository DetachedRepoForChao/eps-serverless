import { Injectable } from '@angular/core';
import {Department} from './shared/department.model';

@Injectable()

export class Globals {

  departments: Department[];

  constructor() {}

  public localStorageItem(id: string): string {
    return localStorage.getItem(id);
  }


}
