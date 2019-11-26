import { Component, OnInit } from '@angular/core';
import {LeaderboardService, LeaderboardUser} from '../../../shared/leaderboard.service';
import {MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {DepartmentEmployee} from '../../manager-user/gift-points/gift-points.component';
import {DepartmentService} from '../../../shared/department.service';
import {Department} from '../../../shared/department.model';
import {Storage} from 'aws-amplify';
import {ImageService} from '../../../shared/image.service';
import {forkJoin, observable, Observable} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {UserStore} from '../../../entity-store/user/state/user.store';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {MetricsService} from '../../../entity-store/metrics/state/metrics.service';
import {MetricsQuery} from '../../../entity-store/metrics/state/metrics.query';
import {UserHasStoreItemQuery} from '../../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {StoreItemQuery} from '../../../entity-store/store-item/state/store-item.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {FeatureQuery} from '../../../entity-store/feature/state/feature.query';
import {AuthService} from '../../../login/auth.service';

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
              private departmentService: DepartmentService,
              private imageService: ImageService,
              private spinner: NgxSpinnerService,
              private entityUserService: EntityUserService,
              private userStore: UserStore,
              public entityUserQuery: EntityUserQuery,
              public achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              public entityCurrentUserQuery: EntityCurrentUserQuery,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private entityCurrentUserService: EntityCurrentUserService,
              private storeItemQuery: StoreItemQuery,
              private pointItemQuery: PointItemQuery,
              private metricsQuery: MetricsQuery,
              private featureQuery: FeatureQuery,
              private authService: AuthService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    console.log(`${functionFullName}: showing leaderboard-card-spinner`);
    this.spinner.show('leaderboard-card-spinner');
    this.spinner.show('avatar-loading-spinner');

    this.entityUserService.cacheUsers().subscribe();

    this.leaderboardUsers$ = this.entityUserQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.isCardLoading = false;

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
    this.entityCurrentUserService.updatePointsBalance(123);
  }

  getFirstDigit(number: number) {
    const one = String(number).charAt(0);
    return Number(one);
  }

  test2() {
    console.log('achievement family');
    console.log(this.achievementQuery.getAchievementFamily('SignIn'));
    console.log('get all');
    console.log(this.achievementQuery.getAll());
    console.log('filtered achievements');
    this.achievementQuery.filterAchievements().subscribe(result => console.log(result));
    console.log('completed');
    console.log(this.achievementQuery.getCompleteAchievements());
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

    const metrics$ = this.metricsQuery.selectAll();
    metrics$.subscribe(metrics => {
      console.log(metrics);
    }).unsubscribe();

    // this.entityUserQuery.getUserCompleteAchievementCount(47);

    console.log(this.achievementQuery.getCompleteAchievements());
    console.log(this.achievementQuery.getCompleteAchievementById(1));

    this.achievementQuery.selectAll().subscribe(x => {
      console.log(x);
    });

    console.log(this.achievementQuery.getAchievementFamilies());
    // console.log(Object.keys(this.achievementQuery.getAchievementFamilies()));

    this.featureQuery.selectAll()
      .subscribe(x => {
        console.log(x);
      });
  }
}
