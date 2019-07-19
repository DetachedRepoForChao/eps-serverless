import { Component, OnInit } from '@angular/core';
import {LeaderboardService, LeaderboardUser} from '../../../shared/leaderboard.service';
import {MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {DepartmentEmployee} from '../../manager-user/gift-points/gift-points.component';
import {AvatarService} from '../../../shared/avatar.service';
import {Globals} from '../../../globals';
import {DepartmentService} from '../../../shared/department.service';
import {GlobalVariableService} from '../../../shared/global-variable.service';
import {Department} from '../../../shared/department.model';

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

@Component({
  selector: 'app-leaderboard-card',
  templateUrl: './leaderboard-card.component.html',
  styleUrls: ['./leaderboard-card.component.css']
})
export class LeaderboardCardComponent implements OnInit {
  componentName = 'leaderboard-card.component';
  leaderboardUsers: LeaderboardUser[] = [];
  leaderboardUsersTop: LeaderboardUser[] = [];
  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'username', 'email', 'department'];

  departments: Department[] = [];

  selectedRow;

  constructor(public leaderboardService: LeaderboardService,
              private avatarService: AvatarService,
              private globals: Globals,
              private departmentService: DepartmentService,
              private globalVariableService: GlobalVariableService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: populating leaderboard data`);
    this.populateLeaderboardDataSource().then(() => {
      console.log(`${functionFullName}: leaderboard data populated`);
      console.log(`${functionFullName}: leaderboardUsers:`);
      console.log(this.leaderboardUsers);
    });


    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }

  populateLeaderboardDataSource(): Promise<any> {
    const functionName = 'populateLeaderboardDataSource';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Promise(resolve => {
      console.log(`${functionFullName}: retrieving leaderboard users from leaderboard service`);
      this.leaderboardService.getPointsLeaderboard()
        .then((res: any) => {
          if (res) {
            console.log(res);
            this.leaderboardUsers = [];
            console.log(`${functionFullName}: populate departments`);
            this.departmentService.getDepartments()
              .then((departments: Department[]) => {
                this.departments = departments;

                for ( let i = 0; i < res.length; i++) {
                  console.log(`${functionFullName}: current leadboardUser item`);
                  console.log(res[i]);
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
              });

            this.leaderboardUsersTop = this.leaderboardUsers.slice(0, 4);
            console.log(`${functionFullName}: this.leaderboardUsers`);
            console.log(this.leaderboardUsers);
            resolve();
          } else {
            console.error(`${functionFullName}: Error retrieving leaderboard users`);
            resolve();
          }
        }).catch(error => {
        console.warn(`${functionFullName}: Error retrieving leaderboard users from leaderboard service`);
        console.error(error);
        resolve();
      });
    });
  }


  onRowClick(user) {
    this.selectedRow = user;
  }
}
