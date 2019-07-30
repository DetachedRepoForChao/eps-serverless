import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department} from '../../../shared/department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {forkJoin, Observable} from 'rxjs';
import {GlobalVariableService} from '../../../shared/global-variable.service';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {DepartmentService} from '../../../shared/department.service';
import {AvatarService} from '../../../shared/avatar.service';
import {DepartmentEmployee} from './gift-points.component';
import {LeaderboardUser} from '../../../shared/leaderboard.service';

// Create a variable to interact with jquery
declare var $: any;

export interface DepartmentEmployee {
  id: number;
  avatar: string;
  name: string;
  username: string;
  email: string;
  position: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class GiftPointsService {
  componentName = 'gift-points-service.service';
  departments: Department[];

  departmentEmployees: DepartmentEmployee[] = [];
  department: Department;
  displayedColumns: string[] = ['select', 'avatar', 'name', 'username', 'email', 'position', 'points'];
  selection = new SelectionModel<DepartmentEmployee>(true, []);
  dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList = [];
  selectedPointItem = {};
  selectedEmployees = [];

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'username', 'email', 'department'];
  // public leaderboardUsers: LeaderboardUser[] = [];
  // public leaderboardUsersTop: LeaderboardUser[] = [];

  // public leaderboardUsers: LeaderboardUser[];
  // public leaderboardUsersTop: LeaderboardUser[];

  // selection = new SelectionModel<LeaderboardUser>(true, []);
  // dataSource = new MatTableDataSource<LeaderboardUser>();
  // public currentUserLeaderboardRecord;

  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService,
              private departmentService: DepartmentService,
              private authService: AuthService,
              private avatarService: AvatarService) { }

  populateEmployeeDataSource(): Observable<any> {
    const functionName = 'populateEmployeeDataSource';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      let departmentEmployees: DepartmentEmployee[] = [];

      if (localStorage.getItem('departmentId')) {
        this.departmentService.getEmployeesByDepartmentId(+localStorage.getItem('departmentId'))
          .subscribe(res => {
            console.log(res);
            if (res) {
              console.log(`${functionFullName}: employee list for department id ${+localStorage.getItem('departmentId')}`);
              console.log(res);

              for ( let i = 0; i < res.length; i++) {
                const userData = {
                  id: res[i].id,
                  username: res[i].username,
                  firstName: res[i].firstName,
                  lastName: res[i].lastName,
                  email: res[i].email,
                  position: res[i].position,
                  securityRoleId: res[i].securityRoleId,
                  points: res[i].points,
                  avatarUrl: res[i].avatarUrl,
                };

                const departmentEmployee: DepartmentEmployee = {
                  id: userData.id,
                  avatar: userData.avatarUrl,
                  name: userData.firstName + ' ' + userData.lastName,
                  username: userData.username,
                  email: userData.email,
                  position: userData.position,
                  points: userData.points,
                };

                console.log(departmentEmployee);

                departmentEmployees = departmentEmployees.concat(departmentEmployee);
              }
            }

            console.log(`${functionFullName}: departmentEmployees`);
            console.log(departmentEmployees);
            this.resolveDepartmentEmployeeAvatars(departmentEmployees);
            this.departmentEmployees = departmentEmployees;
            observer.next(departmentEmployees);
            observer.complete();

            this.dataSource.data = this.departmentEmployees;
            console.log(`${functionFullName}: department employees data source`);
            console.log(this.dataSource.data);
            observer.next();
            // observer.complete();

          });
      } else {
        console.log(`${functionFullName}: departmentId does not exist in local storage`);
        observer.next();
        // observer.complete();
      }

      observer.complete();
    });
  }

  resolveDepartmentEmployeeAvatars(departmentEmployees: DepartmentEmployee[]) {
    const functionName = 'resolveDepartmentEmployeeAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    let departmentEmployeesNew: DepartmentEmployee[] = [];
    const observables: Observable<any>[] = [];

    for (let i = 0; i < departmentEmployees.length; i++) {
      observables.push(this.avatarService.resolveAvatar(departmentEmployees[i]));
    }

    return forkJoin(observables)
      .subscribe(departmentEmployeeArray => {
        /*     console.log(`${functionFullName}: forkJoin`);
             console.log(`${functionFullName}: leaderboardUserArray`);
             console.log(leaderboardUserArray);*/

        departmentEmployeeArray.forEach(resolvedDepartmentEmployee => {
          // const resolvedAvatarUrl = data['userAchievementProgress'].find(x => x.achievement_id === item['achievement'].id);

          departmentEmployeesNew = departmentEmployeesNew.concat(resolvedDepartmentEmployee);
        });

        // this.leaderboardUsersTop = leaderboardUsersNew.slice(0, 4);

        // return {status: true, message: `${functionFullName}: resolvedAvatarUrls retrieved successfully`};
      });
  }
}
