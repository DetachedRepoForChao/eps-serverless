import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, observable, Observable, Subject, Subscription} from 'rxjs';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {takeUntil} from 'rxjs/operators';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-leaderboard-card',
  templateUrl: './leaderboard-card.component.html',
  styleUrls: ['./leaderboard-card.component.css']
})
export class LeaderboardCardComponent implements OnInit, OnDestroy {
  componentName = 'leaderboard-card.component';
  private unsubscribe$ = new Subject();
  private usersLoading$ = new Subject();

  isCardLoading: boolean;

  displayedColumns: string[] = ['rank', 'avatar', 'name', 'points'];
  displayedColumnsAll: string[] = ['rank', 'avatar', 'name', 'points', 'department'];

  leaderboardUsers: EntityUserModel[];

  constructor(public userQuery: EntityUserQuery,
              public achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              public currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        console.log('achievements loading: ' + isLoading);
        if (!isLoading) {
          this.userQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1,
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(users => {
              this.leaderboardUsers = users;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    this.isCardLoading = false;

  }


  getFirstDigit(number: number) {
    const one = String(number).charAt(0);
    return Number(one);
  }

  ngOnDestroy(): void {
    this.usersLoading$.next();
    this.usersLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
