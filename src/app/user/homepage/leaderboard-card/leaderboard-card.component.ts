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
import {Storage} from 'aws-amplify';
import {ImageService} from '../../../shared/image.service';
import {forkJoin, Observable} from 'rxjs';
import {AchievementData} from '../../../shared/achievement/achievement.component';

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
  avatarList: string[] = [];
  departments: Department[] = [];

  selectedRow;

  constructor(public leaderboardService: LeaderboardService,
              private avatarService: AvatarService,
              private globals: Globals,
              private departmentService: DepartmentService,
              private imageService: ImageService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.leaderboardService.getPointsLeaderboard()
      .then(result => {
        console.log(`${functionFullName}: populating leaderboard data`);
        this.leaderboardService.populateLeaderboardDataSource(result).then(() => {
          // this.leaderboardUsers = this.leaderboardService.leaderboardUsers;
          // this.leaderboardUsersTop = this.leaderboardService.leaderboardUsersTop;
          console.log(`${functionFullName}: leaderboard data populated`);
          // console.log(`${functionFullName}: leaderboardUsers:`);
          // console.log(this.leaderboardUsers);
          // console.log(`${functionFullName}: leaderboardUsersTop:`);
          // console.log(this.leaderboardUsersTop);
        });
      });


    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }

  onRowClick(user) {
    this.selectedRow = user;
  }
}
