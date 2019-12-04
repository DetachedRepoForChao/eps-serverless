import {Component, EventEmitter, Injectable, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import { Achievement} from './achievement.model';
import { UserAchievementProgress} from './user-achievement-progress.model';
import { Globals} from '../../globals';
import {MatTableDataSource} from '@angular/material';
import {DepartmentEmployee} from '../../user/manager-user/gift-points/gift-points.component';
import {Observable, forkJoin, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {AchievementModel} from '../../entity-store/achievement/state/achievement.model';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {FeatureService} from '../../entity-store/feature/state/feature.service';
import {FeatureQuery} from '../../entity-store/feature/state/feature.query';
import {EntityUserModel} from '../../entity-store/user/state/entity-user.model';
import {NavigationService} from '../navigation.service';
import {OtherUserAchievementService} from '../../entity-store/other-user-achievement/state/other-user-achievement.service';
import {OtherUserAchievementQuery} from '../../entity-store/other-user-achievement/state/other-user-achievement.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {Order} from '@datorama/akita';
import {OtherUserAchievementModel} from '../../entity-store/other-user-achievement/state/other-user-achievement.model';

declare var $: any;

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent implements OnInit, OnDestroy, OnChanges {
  @Input() inputUser: EntityUserModel;
  @Output() clearInputUser = new EventEmitter<any>();

  componentName = 'achievement.component';

  public config: PerfectScrollbarConfigInterface = {};

  user$: Observable<EntityUserModel[]>;
  user: EntityUserModel;
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUserSub: Subscription;
  currentUser: EntityCurrentUserModel;
  achievements$: Observable<AchievementModel[]>;
  achievements: AchievementModel[];
  otherUserAchievements$: Observable<OtherUserAchievementModel[]>;
  otherUserAchievements: OtherUserAchievementModel[];
  families: string[];
  keys: string[];
  features$;
  isCurrentUserDataRetrieved = false;
  isUserDataRetrieved = false;
  achievementsRetrieving = false;

  constructor(private globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private achievementQuery: AchievementQuery,
              private featureService: FeatureService,
              private featureQuery: FeatureQuery,
              private otherUserAchievementService: OtherUserAchievementService,
              private otherUserAchievementQuery: OtherUserAchievementQuery,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private currentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery,
              private navigationService: NavigationService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.currentUserService.cacheCurrentUser().subscribe();
    this.userService.cacheUsers().subscribe();
    this.achievementService.cacheAchievements().subscribe();
    this.featureService.cacheFeatures().subscribe();

    if (this.inputUser) {
      this.populateUserData();
    } else {
      this.populateCurrentUserData();
    }

    const parentScope = this;
    $('#achievementModal').on('hidden.bs.modal',
      function (e) {
        console.log('running on hidden function');
        console.log(e);
        parentScope.inputUser = null;
        parentScope.navigationService.achievementComponentInputUser = null;
        parentScope.clearInputUser.emit(true);
        parentScope.navigationService.achievementModalActive = false;
      });
  }

  populateCurrentUserData() {
    this.currentUserQuery.selectLoading()
      .subscribe(isLoading => {
        console.log(`Current User loading status is ${isLoading}`);
        if (!isLoading) {
          this.currentUser$ = this.currentUserQuery.selectAll();
          this.currentUserSub = this.currentUser$.subscribe((currentUser: EntityCurrentUserModel[]) => {
            this.populateCurrentUserAchievements(currentUser[0]);

            // Pull user info into a static variable if this hasn't happened yet
            if (!this.currentUser) {
              this.currentUser = this.currentUserQuery.getAll()[0];
            }

            this.isCurrentUserDataRetrieved = true;
          });
        }
      });
  }

  populateCurrentUserAchievements(currentUser: EntityCurrentUserModel) {
    if (!this.achievementsRetrieving) {
      this.achievementsRetrieving = true;

      this.achievements = this.achievementQuery.getAll({
        sortBy: 'family'
      });

      console.log('achievements');
      console.log(this.achievements);

      this.achievements$ = this.achievementQuery.selectAll({
        sortBy: 'family'
      });

      this.achievementQuery.selectAll()
        .subscribe(result => {
          this.families = this.groupBy(result, 'family');
          this.keys = Object.keys(this.families);
        });
    } else {
      console.log(`Already retrieving current user achievements`);
    }
  }

  populateUserData() {
    this.userQuery.selectLoading()
      .subscribe(isLoading => {
        console.log(`User loading status is ${isLoading}`);
        if (!isLoading) {
          this.user$ = this.userQuery.selectAll({
            filterBy: e => e.username === this.inputUser.username
          });

          this.user$.subscribe((user: EntityUserModel[]) => {
            this.populateUserAchievements(user[0]);

            // Pull user info into a static variable if this hasn't happened yet
            if (!this.user) {
              this.user = this.userQuery.getAll()[0];
            }

            this.isUserDataRetrieved = true;
          });
        }
      });
  }

  populateUserAchievements(user: EntityUserModel) {
    if (!this.achievementsRetrieving) {
      this.achievementsRetrieving = true;
      this.otherUserAchievementService.cacheAchievements(user)
        .subscribe((result: Observable<OtherUserAchievementModel[]> | any) => {
          if (result !== false) {
            result.subscribe(() => {
              this.otherUserAchievements = this.otherUserAchievementQuery.getAll({
                filterBy: e => e.userId === user.userId,
                sortBy: 'family'
              });
              console.log('other user achievements');
              console.log(this.otherUserAchievements);
            });

            this.otherUserAchievements$ = this.otherUserAchievementQuery.selectAll({
              filterBy: e => e.userId === user.userId,
              sortBy: 'family'
            });

            this.otherUserAchievements$.subscribe((achievements: OtherUserAchievementModel[]) => {
              this.families = this.groupBy(achievements, 'family');
              this.keys = Object.keys(this.families);
            });
          } else {
            console.log(`Cache Other User Achievements returned ${result}`);
            // We may have retrieved the data but the otherUserAchievements variable may be null... this accounts for that
            if (!this.otherUserAchievements) {
              this.otherUserAchievements = this.otherUserAchievementQuery.getAll({
                filterBy: e => e.userId === user.userId,
                sortBy: 'family'
              });

              this.otherUserAchievements$ = this.otherUserAchievementQuery.selectAll({
                filterBy: e => e.userId === user.userId,
                sortBy: 'family'
              });

              this.otherUserAchievements$.subscribe((achievements: OtherUserAchievementModel[]) => {
                this.families = this.groupBy(achievements, 'family');
                this.keys = Object.keys(this.families);
              });
            }
          }
        });
    } else {
      console.log(`Already retrieving other user achievements`);
    }
  }

  // groupBy function reference: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
  // I'm not sure why or how this works...
  groupBy (xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  acknowledgeAchievement(achievement: AchievementModel) {
    const functionName = 'acknowledgeAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Acknowledging completed achievement:`);
    console.log(achievement);

    this.achievementService.acknowledgeAchievementComplete(achievement.progressId)
      .subscribe(result => {
        console.log(`${functionFullName}: Acknowledge result:`);
        console.log(result);

        // this.achievementService.getUserAchievements().subscribe();
        // $('#achievementModal').modal('hide');
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);

    if (changes) {
      console.log('clearing all variables');
      this.user$ = null;
      this.user = null;
      this.currentUser$ = null;
      this.currentUser = null;
      this.achievements$ = null;
      this.achievements = null;
      this.otherUserAchievements$ = null;
      this.otherUserAchievements = null;
      this.families = null;
      this.keys = null;
      this.features$ = null;
      this.isCurrentUserDataRetrieved = false;
      this.isUserDataRetrieved = false;
      this.achievementsRetrieving = false;

      console.log('on changes input user:');
      console.log(this.inputUser);

      console.log('on changes populating data');
      if (this.inputUser) {
        this.populateUserData();
      } else {
        this.populateCurrentUserData();
      }

      const parentScope = this;
      $('#achievementModal').on('hidden.bs.modal',
        function (e) {
          console.log('running on hidden function');
          console.log(e);
          parentScope.inputUser = null;
          parentScope.navigationService.achievementComponentInputUser = null;
          parentScope.clearInputUser.emit(true);
          parentScope.navigationService.achievementModalActive = false;
        });
    }
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.currentUserSub.unsubscribe();
    this.inputUser = null;
    this.navigationService.achievementComponentInputUser = null;
    this.navigationService.achievementModalActive = false;
    this.clearInputUser.emit(true);
  }
}
