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
import {NgxSpinnerService} from 'ngx-spinner';
import {EntityUserAvatarService} from '../../../entity-store/user-avatar/state/entity-user-avatar.service';
import {UserAvatarStore} from '../../../entity-store/user-avatar/state/user-avatar.store';
import {EntityUserAvatarQuery} from '../../../entity-store/user-avatar/state/entity-user-avatar.query';

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
  avatarList: string[] = [];
  departments: Department[] = [];

  selectedRow;

  constructor(public leaderboardService: LeaderboardService,
              private avatarService: AvatarService,
              private globals: Globals,
              private departmentService: DepartmentService,
              private imageService: ImageService,
              private spinner: NgxSpinnerService,
              private userAvatarService: EntityUserAvatarService,
              private userAvatarStore: UserAvatarStore,
              private userAvatarQuery: EntityUserAvatarQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    console.log(`${functionFullName}: showing leaderboard-card-spinner`);
    this.spinner.show('leaderboard-card-spinner');
    this.spinner.show('avatar-loading-spinner');

    this.userAvatarService.cacheUserAvatars().subscribe();
    this.leaderboardService.getPointsLeaderboard()
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
      });


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
}
