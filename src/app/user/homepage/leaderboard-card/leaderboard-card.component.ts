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

    /*if (this.avatarList.length === 0) {
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
    }*/


    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }

/*  populateLeaderboardDataSource(leaderboardData): Promise<any> {
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
            // const userAvatarKey = this.avatarList.find(x => x.includes(`pic-${leaderboardData[i].id}.png`) === true);
            const avatarPath = leaderboardData[i].avatarUrl;
            const level = avatarPath.split('/')[0];
            const cognitoIdentityId = avatarPath.split('/')[1];
            const key = avatarPath.split('/')[2];

            // console.log(`userAvatarKey: ${userAvatarKey}`);
            console.log(`${functionFullName}: key: ${key}`);
            console.log(`${functionFullName}: identityId: ${cognitoIdentityId}`);

            Storage.get(key, {
              level: level,
              identityId: cognitoIdentityId
            })
              .then((avatarUrl: string) => {
                console.log(`${functionFullName}: avatarUrl: ${avatarUrl}`);

                this.imageService.getImage(avatarUrl)
                  .subscribe((blob) => {
                    console.log(`${functionFullName}: avatarBlob: ${blob}`);

                    let avatarImg: any = null;
                    console.log(`${functionFullName}: createImageFromBlob`);
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                      console.log(`${functionFullName}: userAvatar blob:`);
                      console.log(reader.result);
                      avatarImg = reader.result;

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

                      console.log(`${functionFullName}: leaderboardUser:`);
                      console.log(leaderboardUser);

                      this.leaderboardUsers = this.leaderboardUsers.concat(leaderboardUser);
                    }, false);

                    if (blob) {
                      reader.readAsDataURL(blob);
                    }
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
  }*/

  /*populateLeaderboardDataSource(leaderboardData): Promise<any> {
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
   /!*     console.log(`${functionFullName}: forkJoin`);
        console.log(`${functionFullName}: leaderboardUserArray`);
        console.log(leaderboardUserArray);*!/

        leaderboardUserArray.forEach(resolvedLeaderboardUser => {
          // const resolvedAvatarUrl = data['userAchievementProgress'].find(x => x.achievement_id === item['achievement'].id);

          leaderboardUsersNew = leaderboardUsersNew.concat(resolvedLeaderboardUser);
        });

        // this.leaderboardUsersTop = leaderboardUsersNew.slice(0, 4);

        // return {status: true, message: `${functionFullName}: resolvedAvatarUrls retrieved successfully`};
      });
  }*/

  /*const observables: Observable<any>[] = [];
  // Get the associated Achievement details
  console.log(data['userAchievementProgress']);
  for (let i = 0; i < data['userAchievementProgress'].length; i++) {
  const currentAchievementProgressItem = data['userAchievementProgress'][i];
  console.log('currentAchievementProgressItem');
  console.log(currentAchievementProgressItem);
  observables.push(this.achievementService.getAchievementById(currentAchievementProgressItem.achievement_id));
}

return forkJoin(observables)
  .subscribe(dataArray => {
    console.log('forkJoin');
    console.log(' data[\'userAchievementProgress\']');
    console.log( data['userAchievementProgress']);

    dataArray.forEach(item => {
      const currentAchievementProgressItem = data['userAchievementProgress'].find(x => x.achievement_id === item['achievement'].id);

      const achievementData: AchievementData = {
        name: item['achievement'].name,
        goal: item['achievement'].cost,
        progress: currentAchievementProgressItem.goalProgress,
        status: currentAchievementProgressItem.status
      };

      this.achievementDataList = this.achievementDataList.concat(achievementData);

    });

    this.dataSource.data = this.achievementDataList;
    console.log('START this.dataSource.data');
    console.log(this.dataSource.data);
    console.log('END this.dataSource.data');
    return {status: true, message: 'Datasource updated successfully'};
  });*/


  onRowClick(user) {
    this.selectedRow = user;
  }
}
