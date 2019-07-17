import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Department} from './department.model';

@Injectable({
  providedIn: 'root'
})

export class GlobalVariableService {


  private userLoggedInSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public userLoggedIn = this.userLoggedInSource.asObservable();

  private sessionExistsSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public sessionExists = this.sessionExistsSource.asObservable();

  private sessionCreateListenerExistsSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public sessionCreateListenerExists = this.sessionCreateListenerExistsSource.asObservable();

  private testSessionListenerExistsSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public testSessionListenerExists = this.testSessionListenerExistsSource.asObservable();

  private checkSessionHeartbeatListenerExistsSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public checkSessionHeartbeatListenerExists = this.checkSessionHeartbeatListenerExistsSource.asObservable();




  private departmentListSource: BehaviorSubject<Department[]> = new BehaviorSubject([]);
  public departmentList = this.departmentListSource.asObservable();

  public setDepartmentList(value: Department[]) {
    console.log('setDepartmentList:');
    console.log(value);
    this.departmentListSource.next(value);
  }




  public setUserLoggedIn(value: boolean) {
    this.userLoggedInSource.next(value);
  }

  private resetUserLoggedIn() {
    this.userLoggedInSource.next(false);
  }


  public setSessionExists(value: boolean) {
    this.sessionCreateListenerExistsSource.next(value);
  }

  private resetSessionExists() {
    this.sessionExistsSource.next(false);
  }

  public setSessionCreateListenerExists(value: boolean) {
    this.sessionCreateListenerExistsSource.next(value);
  }

  private resetSessionCreateListenerExists() {
    this.sessionCreateListenerExistsSource.next(false);
  }

  public setTestSessionListenerExists(value: boolean) {
    this.testSessionListenerExistsSource.next(value);
  }

  private resetTestSessionListenerExists() {
    this.testSessionListenerExistsSource.next(false);
  }

  public setCheckSessionHeartbeatListenerExists(value: boolean) {
    this.checkSessionHeartbeatListenerExistsSource.next(value);
  }

  private resetSessionHeartbeatListenerExistsSource() {
    this.checkSessionHeartbeatListenerExistsSource.next(false);
  }

  public resetAllVariables() {
    this.resetUserLoggedIn();
    this.resetSessionExists();
    this.resetSessionCreateListenerExists();
    this.resetSessionHeartbeatListenerExistsSource();
    this.resetTestSessionListenerExists();
  }
}
