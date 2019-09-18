import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {forkJoin, Observable} from 'rxjs';
import {GlobalVariableService} from './global-variable.service';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {DepartmentService} from './department.service';
import {AvatarService} from './avatar/avatar.service';
import {EntityUserService} from '../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../entity-store/user/state/entity-user.query';

// Create a variable to interact with jquery
declare var $: any;

export interface LeaderboardUser {
  rank: number;
  id: number;
  username: string;
  name: string;
  email: string;
  position: string;
  points: number;
  avatar: string;
  department: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  componentName = 'leaderboard.service';
  departments: Department[];

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'username', 'email', 'department'];
  // public leaderboardUsers: LeaderboardUser[] = [];
  // public leaderboardUsersTop: LeaderboardUser[] = [];

  public leaderboardUsers: LeaderboardUser[];
  public leaderboardUsersTop: LeaderboardUser[];

  selection = new SelectionModel<LeaderboardUser>(true, []);
  dataSource = new MatTableDataSource<LeaderboardUser>();
  public currentUserLeaderboardRecord;

  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService,
              private departmentService: DepartmentService,
              private authService: AuthService,
              private avatarService: AvatarService,
              private entityUserService: EntityUserService,
              private entityUserQuery: EntityUserQuery) { }

  populateLeaderboardDataSource(leaderboardData): Observable<LeaderboardUser[]> {
    const functionName = 'populateLeaderboardDataSource';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<LeaderboardUser[]>(observer => {
      console.log(leaderboardData);
      let leaderboardUsers: LeaderboardUser[] = [];
      // let leaderboardUsersTop: LeaderboardUser[] = [];
      console.log(`${functionFullName}: populate departments`);
      this.departmentService.getDepartments()
        .subscribe((departments: Department[]) => {
          this.departments = departments;

          for ( let i = 0; i < leaderboardData.length; i++) {
            console.log(`${functionFullName}: current leadboardUser item`);
            console.log(leaderboardData[i]);
            const userData = {
              rank: i + 1,
              id: leaderboardData[i].id,
              username: leaderboardData[i].username,
              firstName: leaderboardData[i].firstName,
              lastName: leaderboardData[i].lastName,
              email: leaderboardData[i].email,
              position: leaderboardData[i].position,
              departmentId: leaderboardData[i].departmentId,
              points: leaderboardData[i].points,
              avatarUrl: leaderboardData[i].avatarUrl
            };

            const departmentName = (departments.find(x => x.Id === userData.departmentId)).Name;
            // console.log(`${functionFullName}: departmentName:  ${departmentName}`);

            const leaderboardUser: LeaderboardUser = {
              rank: userData.rank,
              id: userData.id,
              username: userData.username,
              name: userData.firstName + ' ' + userData.lastName,
              email: userData.email,
              position: userData.position,
              points: userData.points,
              avatar: userData.avatarUrl,
              department: departmentName,
            };

            console.log(`${functionFullName}: leaderboardUser`);
            console.log(leaderboardUser);

            leaderboardUsers = leaderboardUsers.concat(leaderboardUser);
          }

          // return this.leaderboardUsers;

          // .then((leaderboardUsers: LeaderboardUser[]) => {
          //   this.resolveLeaderboardAvatars(leaderboardUsers);
          console.log(`${functionFullName}: leaderboardUsers`);
          console.log(leaderboardUsers);
          // this.resolveLeaderboardAvatars(leaderboardUsers);
          this.leaderboardUsers = leaderboardUsers;
          this.leaderboardUsersTop = leaderboardUsers.slice(0, 4);
          observer.next(leaderboardUsers);
          observer.complete();

/*          leaderboardUsersTop = leaderboardUsers.slice(0, 4);
          console.log(`${functionFullName}: leaderboardUsersTop`);
          console.log(leaderboardUsersTop);
          observer.next(leaderboardUsersTop);
          observer.complete();*/
          // });
        });
    });
  }

  getPointsLeaderboard(): Observable<any> {
    const functionName = 'getPointsLeaderboard';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointsLeaderboard', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

/*  getPointsLeaderboard(): Observable<any> {
    const functionName = 'getPointsLeaderboard';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      const users$ = this.entityUserQuery.selectAll({
          filterBy: userEntity => userEntity.securityRole.Id === 1,
      });

      users$.subscribe(users => {
        console.log(users);
        observer.next(users);
        observer.complete();
      });


      /!*this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointsLeaderboard', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });*!/
    });
  }*/

  getUserPointsLeaderboardRecord(username: string): Observable<LeaderboardUser> {
    const functionName = 'getUserPointsLeaderboardRecord';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<LeaderboardUser>(observer => {
      this.getPointsLeaderboard()
        .subscribe((res: any) => {
          if (res) {
            console.log(res);
            let leaderboardUsers: LeaderboardUser[] = [];
            // this.globalVariableService.departmentList.subscribe((departmentList: Department[]) => {
            this.departmentService.getDepartments().subscribe((departmentList: Department[]) => {
              for ( let i = 0; i < res.length; i++) {
                const userData = {
                  rank: i + 1,
                  id: res[i].id,
                  username: res[i].username,
                  firstName: res[i].firstName,
                  lastName: res[i].lastName,
                  email: res[i].email,
                  position: res[i].position,
                  departmentId: res[i].departmentId,
                  points: res[i].points,
                  avatarUrl: res[i].avatarPath
                };

                const departmentName = (departmentList.find(department => department.Id === userData.departmentId)).Name;

                const leaderboardUser: LeaderboardUser = {
                  rank: userData.rank,
                  id: userData.id,
                  username: userData.username,
                  name: userData.firstName + ' ' + userData.lastName,
                  email: userData.email,
                  position: userData.position,
                  points: userData.points,
                  avatar: userData.avatarUrl,
                  department: departmentName,
                };

                // console.log(leaderboardUser);

                leaderboardUsers = leaderboardUsers.concat(leaderboardUser);
              }

              const userLeaderboardRecord = leaderboardUsers.find(result => result.username === username);
              // console.log('leadboardUsers.find');
              console.log(userLeaderboardRecord);
              this.currentUserLeaderboardRecord = userLeaderboardRecord;
              observer.next(userLeaderboardRecord);
              observer.complete();
              // return userLeaderboardRecord;
            });
          }
        });
    });
  }

/*  isUserInLeaderboardTop5(username: string): Observable<boolean> {
    const functionName = 'isUserInLeaderboardTop5';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable(observer => {
      if (this.leaderboardUsersTop.find(x => x.username === username)) {
        console.log(`${functionFullName}: user with username ${username} is in the Leaderboard Top 5!`);
        observer.next(true);
        // return true;
      } else {
        console.log(`${functionFullName}: user with username ${username} is NOT in the Leaderboard Top 5!`);
        observer.next(false);
        // return false;
      }
      observer.complete();
    });


  }*/
}
