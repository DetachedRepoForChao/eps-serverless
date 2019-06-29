import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  constructor() {}

  public localStorageItem(id: string): string {
    return localStorage.getItem(id);
  }


}
