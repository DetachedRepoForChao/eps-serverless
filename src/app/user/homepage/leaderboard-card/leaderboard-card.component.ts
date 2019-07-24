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

    if (this.avatarList.length === 0) {
      this.avatarService.getAvatars()
        .then(avatarList => {
          this.avatarList = avatarList;

          this.leaderboardService.getPointsLeaderboard()
            .then(result => {
              console.log(`${functionFullName}: populating leaderboard data`);
              this.populateLeaderboardDataSource(result).then(() => {
                console.log(`${functionFullName}: leaderboard data populated`);
                console.log(`${functionFullName}: leaderboardUsers:`);
                console.log(this.leaderboardUsers);
              });
            });
        });
    } else {
      this.leaderboardService.getPointsLeaderboard()
        .then(result => {
          console.log(`${functionFullName}: populating leaderboard data`);
          this.populateLeaderboardDataSource(result).then(() => {
            console.log(`${functionFullName}: leaderboard data populated`);
            console.log(`${functionFullName}: leaderboardUsers:`);
            console.log(this.leaderboardUsers);
          });
        });
    }


    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }

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

            // console.log('avatarList: ');
            // console.log(this.avatarList);
            const userAvatarKey = this.avatarList.find(x => x.includes(`pic-${leaderboardData[i].id}.png`) === true);
            console.log(`userAvatarKey: ${userAvatarKey}`);
            console.log(`key: ${userAvatarKey.split('/')[2]}`);
            console.log(`identityId: ${userAvatarKey.split('/')[1]}`);
            Storage.get(userAvatarKey.split('/')[2], {
              level: 'protected',
              identityId: userAvatarKey.split('/')[1]
            })
              .then((avatarUrl: string) => {
                console.log(`avatarUrl: ${avatarUrl}`);

                this.imageService.getImage(avatarUrl)
                  .subscribe((blob) => {
                    console.log(`avatarBlob: ${blob}`);

                    let avatarImg;
                    console.log('createImageFromBlob');
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                      console.log('userAvatar blob:');
                      console.log(reader.result);
                      avatarImg = reader.result;
                    }, false);

                    if (blob) {
                      reader.readAsDataURL(blob);
                    }

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
                      avatarUrl: avatarImg
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

                    console.log('leaderboardUser:');
                    console.log(leaderboardUser);

                    this.leaderboardUsers = this.leaderboardUsers.concat(leaderboardUser);
                  });
              });
          }

          return this.leaderboardUsers;
        })
        .then((leaderboardUsers) => {
          this.leaderboardUsersTop = leaderboardUsers.slice(0, 4);
          console.log(`${functionFullName}: leaderboardUsers`);
          console.log(this.leaderboardUsersTop);
          resolve();
        });
    });
  }


  onRowClick(user) {
    this.selectedRow = user;
  }
}
