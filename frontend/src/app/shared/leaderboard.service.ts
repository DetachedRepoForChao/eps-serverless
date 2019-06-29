import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityRole } from './securityrole.model';
import { environment } from '../../environments/environment';
import { User } from './user.model';
import { Department } from './department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs';
import {GlobalVariableService} from './global-variable.service';

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

  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'username', 'email', 'department'];
  public leaderboardUsers = [];
  public leaderboardUsersTop = [];
  selection = new SelectionModel<LeaderboardUser>(true, []);
  dataSource = new MatTableDataSource<LeaderboardUser>();
  public currentUserLeaderboardRecord;
  constructor(private http: HttpClient,
              private globalVariableService: GlobalVariableService) { }

  populateLeaderboardDataSource() {
    console.log('populateLeaderboardDataSource');
    return this.getPointsLeaderboard()
      .subscribe(res => {
        if (res) {
          console.log(res);
          this.leaderboardUsers = [];
          for ( let i = 0; i < res['result'].length; i++) {
            const userData = {
              rank: i + 1,
              id: res['result'][i].id,
              username: res['result'][i].username,
              firstName: res['result'][i].firstName,
              lastName: res['result'][i].lastName,
              email: res['result'][i].email,
              position: res['result'][i].position,
              departmentId: res['result'][i].departmentId,
              points: res['result'][i].points,
              avatarUrl: res['result'][i].avatarUrl
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

        $(function () {
          $('[data-toggle="tooltip"]').tooltip();
        });
      });

  }

  getPointsLeaderboard() {
    console.log('getPointsLeaderboard');
    return this.http.get(environment.apiBaseUrl + '/getPointsLeaderboard');
  }

  getUserPointsLeaderboardRecord(userId: number) {
    console.log('getUserPointsLeaderboardRank');
    return this.getPointsLeaderboard()
      .subscribe(res => {
          if (res) {
            console.log(res);
            let leaderboardUsers = [];
            for ( let i = 0; i < res['result'].length; i++) {
              const userData = {
                rank: i + 1,
                id: res['result'][i].id,
                username: res['result'][i].username,
                firstName: res['result'][i].firstName,
                lastName: res['result'][i].lastName,
                email: res['result'][i].email,
                position: res['result'][i].position,
                departmentId: res['result'][i].departmentId,
                points: res['result'][i].points,
                avatarUrl: res['result'][i].avatarUrl
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
