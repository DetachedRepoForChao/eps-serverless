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
import {AvatarService} from './avatar.service';

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
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'username', 'email', 'department'];
  public leaderboardUsers: LeaderboardUser[] = [];
  public leaderboardUsersTop: LeaderboardUser[] = [];
  selection = new SelectionModel<LeaderboardUser>(true, []);
  dataSource = new MatTableDataSource<LeaderboardUser>();
  public currentUserLeaderboardRecord;

  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService,
              private departmentService: DepartmentService,
              private authService: AuthService,
              private avatarService: AvatarService) { }

  populateLeaderboardDataSource(leaderboardData): Promise<any> {
    const functionName = 'populateLeaderboardDataSource';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Promise(resolve => {
      console.log(leaderboardData);
      this.leaderboardUsers = [];
      console.log(`${functionFullName}: populate departments`);
      this.departmentService.getDepartments()
        .then((departments: Department[]) => {
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

            console.log(leaderboardUser);

            this.leaderboardUsers = this.leaderboardUsers.concat(leaderboardUser);
          }

          return this.leaderboardUsers;
        })
        .then((leaderboardUsers: LeaderboardUser[]) => {
          this.resolveLeaderboardAvatars(leaderboardUsers);
          this.leaderboardUsersTop = this.leaderboardUsers.slice(0, 4);
          console.log(`${functionFullName}: leaderboardUsersTop`);
          console.log(this.leaderboardUsersTop);
          resolve();
        });
    });
  }

  resolveLeaderboardAvatars(leaderboardUsers: LeaderboardUser[]) {
    const functionName = 'resolveLeaderboardAvatars';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    let leaderboardUsersNew: LeaderboardUser[] = [];
    const observables: Observable<any>[] = [];

    for (let i = 0; i < leaderboardUsers.length; i++) {
      observables.push(this.avatarService.resolveAvatar(leaderboardUsers[i]));
    }

    return forkJoin(observables)
      .subscribe(leaderboardUserArray => {
        /*     console.log(`${functionFullName}: forkJoin`);
             console.log(`${functionFullName}: leaderboardUserArray`);
             console.log(leaderboardUserArray);*/

        leaderboardUserArray.forEach(resolvedLeaderboardUser => {
          // const resolvedAvatarUrl = data['userAchievementProgress'].find(x => x.achievement_id === item['achievement'].id);

          leaderboardUsersNew = leaderboardUsersNew.concat(resolvedLeaderboardUser);
        });

        // this.leaderboardUsersTop = leaderboardUsersNew.slice(0, 4);

        // return {status: true, message: `${functionFullName}: resolvedAvatarUrls retrieved successfully`};
      });
  }

  async getPointsLeaderboard(): Promise<any> {
    const functionName = 'getPointsLeaderboard';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // return this.http.get(environment.apiBaseUrl + '/getPointsLeaderboard');
    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const myInit = this.myInit;
    myInit.headers['Authorization'] = token;

    return new Promise(resolve => {
      API.get(this.apiName, this.apiPath + '/getPointsLeaderboard', myInit).then(data => {
        console.log(`${functionFullName}: successfully retrieved data from API`);
        console.log(data);
        resolve(data.data);
      });
    });
  }

  getUserPointsLeaderboardRecord(userId: number): Promise<any> {
    const functionName = 'getUserPointsLeaderboardRecord';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Promise<any>(resolve => {
      this.getPointsLeaderboard()
        .then((res: any) => {
          if (res) {
            console.log(res);
            let leaderboardUsers: LeaderboardUser[] = [];
            // this.globalVariableService.departmentList.subscribe((departmentList: Department[]) => {
            this.departmentService.getDepartments().then((departmentList: Department[]) => {
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
                  avatarUrl: res[i].avatarUrl
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

              const userLeaderboardRecord = leaderboardUsers.find(result => result.id === userId);
              // console.log('leadboardUsers.find');
              console.log(userLeaderboardRecord);
              this.currentUserLeaderboardRecord = userLeaderboardRecord;
              resolve(userLeaderboardRecord);
              // return userLeaderboardRecord;
            });
          }
        });
    });
  }

  isUserInLeaderboardTop5(userId: number) {
    const functionName = 'isUserInLeaderboardTop5';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    if (this.leaderboardUsersTop.find(x => x.id === userId)) {
      console.log(`${functionFullName}: user with userId ${userId} is in the Leaderboard Top 5!`);
      return true;
    } else {
      console.log(`${functionFullName}: user with userId ${userId} is NOT in the Leaderboard Top 5!`);
      return false;
    }
  }
}
