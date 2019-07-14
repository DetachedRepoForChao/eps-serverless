import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { User } from '../user.model';
import {Department} from '../department.model';
import {mergeMap, map} from 'rxjs/operators';

export interface Notification {
  Name: string;
  Message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  noAuthHeader = { headers: new HttpHeaders({ 'NoAuth': 'True' }) };

  constructor(private http: HttpClient) {

  }

  showNotification(notification: Notification) {

  }



}
