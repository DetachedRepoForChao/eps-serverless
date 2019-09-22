import { Component, OnInit } from '@angular/core';
import {LeaderboardService, LeaderboardUser} from '../../../shared/leaderboard.service';
import {MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {DepartmentEmployee} from '../../manager-user/gift-points/gift-points.component';
import {AvatarService} from '../../../shared/avatar/avatar.service';
import {Globals} from '../../../globals';
import {DepartmentService} from '../../../shared/department.service';
import {GlobalVariableService} from '../../../shared/global-variable.service';
import {Department} from '../../../shared/department.model';
import {Storage} from 'aws-amplify';
import {ImageService} from '../../../shared/image.service';
import {forkJoin, Observable} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {UserStore} from '../../../entity-store/user/state/user.store';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-leaderboard-card',
  templateUrl: './leaderboard-card.component.html',
  styleUrls: ['./leaderboard-card.component.css']
})
export class LeaderboardCardComponent implements OnInit {
  componentName = 'leaderboard-card.component';
  // leaderboardUsers: LeaderboardUser[] = [];
  // leaderboardUsersTop: LeaderboardUser[] = [];

  // public leaderboardUsers$: Observable<LeaderboardUser[]>;
  // public leaderboardUsersTop$: Observable<LeaderboardUser[]>;
  // private leaderboardUsers: LeaderboardUser[];
  // private leaderboardUsersTop: LeaderboardUser[];

  isCardLoading: boolean;

  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'username', 'email', 'department'];

  leaderboardUsers$: Observable<EntityUserModel[]>;
  selectedRow;

  constructor(public leaderboardService: LeaderboardService,
              private avatarService: AvatarService,
              private globals: Globals,
              private departmentService: DepartmentService,
              private imageService: ImageService,
              private spinner: NgxSpinnerService,
              private entityUserService: EntityUserService,
              private userStore: UserStore,
              private entityUserQuery: EntityUserQuery,
              public achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              public entityCurrentUserQuery: EntityCurrentUserQuery,
              private pointItemQuery: PointItemQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    console.log(`${functionFullName}: showing leaderboard-card-spinner`);
    this.spinner.show('leaderboard-card-spinner');
    this.spinner.show('avatar-loading-spinner');

    this.entityUserService.cacheUsers().subscribe(() => {
      this.leaderboardUsers$ = this.entityUserQuery.selectAll({
        filterBy: userEntity => userEntity.securityRole.Id === 1,
      });

      this.isCardLoading = false;
    });

    /*this.leaderboardService.getPointsLeaderboard()
      .subscribe(result => {
        this.isCardLoading = true;
        console.log(`${functionFullName}: showing leaderboard-card-spinner`);
        this.spinner.show('leaderboard-card-spinner');

        console.log(`${functionFullName}: populating leaderboard data`);
        this.leaderboardService.populateLeaderboardDataSource(result).subscribe(() => {
          console.log(`${functionFullName}: finished populating leaderboard data`);
          this.isCardLoading = false;
          this.spinner.hide('leaderboard-card-spinner');
        });
      });*/


    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }

  onRowClick(user) {
    this.selectedRow = user;
  }

  showAvatarLoadingSpinner() {
    this.spinner.show('avatar-loading-spinner');
  }

  test1() {
    this.achievementService.cacheAchievements().subscribe();
  }

  test2() {
    console.log('achievement family');
    console.log(this.achievementQuery.getAchievementFamily('SignIn'));
    console.log('get all');
    console.log(this.achievementQuery.getAll());
    console.log('filtered achievements');
    this.achievementQuery.filterAchievements().subscribe(result => console.log(result));
    console.log('completed');
    console.log(this.achievementQuery.getCompletedAchievements());
    console.log('user query select all');
    const users$ = this.entityUserQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    users$.subscribe(users => {
      console.log(users);
    });

    const currentUser$ = this.entityCurrentUserQuery.selectAll();
    currentUser$.subscribe(currentUser => {
      console.log(currentUser);
    });

    const pointItems$ = this.pointItemQuery.selectAll();
    pointItems$.subscribe(pointItems => {
      console.log(pointItems);
    });
    // console.log(this.achievementQuery.filterAchievements());
  }
}
