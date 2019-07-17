import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs';
import {GlobalVariableService} from './global-variable.service';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {DepartmentService} from './department.service';

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
  public leaderboardUsers = [];
  public leaderboardUsersTop = [];
  selection = new SelectionModel<LeaderboardUser>(true, []);
  dataSource = new MatTableDataSource<LeaderboardUser>();
  public currentUserLeaderboardRecord;

  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService,
              private departmentService: DepartmentService,
              private authService: AuthService) { }

  populateLeaderboardDataSource() {
    console.log('populateLeaderboardDataSource');
    return this.getPointsLeaderboard()
      .then((res: any) => {
        if (res) {
          console.log(res);
          this.leaderboardUsers = [];
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


                this.globalVariableService.departmentList.subscribe((departmentList: Department[]) => {
                    console.log('department list');
                    console.log(departmentList);
                    const departmentName = (departmentList.find(department => department.Id === userData.departmentId)).Name;
                    console.log('departmentName: ' + departmentName);

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
                );
          }
        }

        // this.dataSource.data = this.leaderboardUsers;
        this.leaderboardUsersTop = this.leaderboardUsers.slice(0, 4);

/*        $(function () {
          $('[data-toggle="tooltip"]').tooltip();
        });*/
      });

  }

  async getPointsLeaderboard() {
    console.log('getPointsLeaderboard');
    // return this.http.get(environment.apiBaseUrl + '/getPointsLeaderboard');
    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getPointsLeaderboard', this.myInit).then(data => {
      console.log('serverless getPointsLeaderboard');
      console.log(data);
      return data.data;
    });
  }

  getUserPointsLeaderboardRecord(userId: number) {
    console.log('getUserPointsLeaderboardRank');
    return this.getPointsLeaderboard()
      .then((res: any) => {
          if (res) {
            console.log(res);
            let leaderboardUsers = [];
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

              this.globalVariableService.departmentList.subscribe((departmentList: Department[]) => {
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
              });
            }

            const userLeaderboardRecord = leaderboardUsers.find(result => result.id === userId);
            // console.log('leadboardUsers.find');
            console.log(userLeaderboardRecord);
            this.currentUserLeaderboardRecord = userLeaderboardRecord;
            // return userLeaderboardRecord;
          }
      });
  }
}
