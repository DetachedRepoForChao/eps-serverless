import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { DepartmentService } from '../shared/department.service';
import { SecurityRoleService} from '../shared/securityRole.service';
import {map} from 'rxjs/operators';
import { UserIdleService } from 'angular-user-idle';
import { tap } from 'rxjs/operators';
import {take} from 'rxjs/operators';
import {forkJoin, Observable, Subscription} from 'rxjs';
import {AuthService} from '../login/auth.service';
import {Auth, Storage} from 'aws-amplify';
import * as Amplify from 'aws-amplify';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import {SecurityRole} from '../shared/securityrole.model';
import {FeedcardService} from '../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {GiftPointsService} from './manager-user/gift-points/gift-points.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import 'rxjs/add/operator/takeWhile';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {resetStores} from '@datorama/akita';
import {AchievementService} from '../entity-store/achievement/state/achievement.service';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {NavigationService} from '../shared/navigation.service';
import {EntityDepartmentService} from '../entity-store/department/state/entity-department.service';
import {EntityUserService} from '../entity-store/user/state/entity-user.service';
import {EntityCurrentUserService} from '../entity-store/current-user/state/entity-current-user.service';
import {StoreItemService} from '../entity-store/store-item/state/store-item.service';
import {UserHasStoreItemService} from '../entity-store/user-has-store-item/state/user-has-store-item.service';
import {PointItemTransactionService} from '../entity-store/point-item-transaction/state/point-item-transaction.service';
import {NotificationService} from '../entity-store/notification/state/notification.service';
import {FeatureService} from '../entity-store/feature/state/feature.service';
import {PointItemService} from '../entity-store/point-item/state/point-item.service';

declare var $: any;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  componentName = 'user.component';
  securityRole;
  securityRoleId;
  securityRoleName;
  socketSessionId;
  idle: number;
  timeout: number;
  timeleft: number;
  ping: number;
  lastPing: string;
  isWatching: boolean;
  isTimer: boolean;
  timeIsUp: boolean;
  timerCount: number;
  isComponentLoading = true;

  private timerStartSubscription: Subscription;
  private timeoutSubscription: Subscription;
  private pingSubscription: Subscription;

  private data: any;

  private display: boolean; // whether to display info in the component
                            // use *ngIf="display" in your html to take
                            // advantage of this

  private alive: boolean; // used to unsubscribe from the TimerObservable
                          // when OnDestroy is called.
  private interval: number;

  public config: PerfectScrollbarConfigInterface = {};

  constructor(private router: Router,
              private securityRoleService: SecurityRoleService,
              private route: ActivatedRoute,
              private userIdle: UserIdleService,
              private http: HttpClient,
              private authService: AuthService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
              private giftPointsService: GiftPointsService,
              private achievementService: AchievementService,
              private departmentService: EntityDepartmentService,
              private userService: EntityUserService,
              private currentUserService: EntityCurrentUserService,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService,
              private pointItemTransactionService: PointItemTransactionService,
              private pointItemService: PointItemService,
              private featureService: FeatureService,

              private notificationService: NotificationService,

              private navigationService: NavigationService) {
    this.display = false;
    this.alive = true;
    this.interval = 10000;
  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log('route');
    console.log(this.route);
    console.log('this.route.snapshot');
    console.log(this.route.snapshot);

    this.achievementService.cacheAchievements()
      .pipe(take(1))
      .subscribe();

    this.departmentService.cacheDepartments()
      .pipe(take(1))
      .subscribe();

    this.userService.cacheUsers()
      .pipe(take(1))
      .subscribe();

    this.currentUserService.cacheCurrentUser()
      .pipe(take(1))
      .subscribe();

    this.storeItemService.cacheStoreItems()
      .pipe(take(1))
      .subscribe();

    this.pointItemService.cachePointItems()
      .pipe(take(1))
      .subscribe();

    this.userHasStoreItemService.cacheUserHasStoreItemRecords()
      .pipe(take(1))
      .subscribe();

    this.featureService.cacheFeatures()
      .pipe(take(1))
      .subscribe();

    this.notificationService.cacheNotifications()
      .pipe(take(1))
      .subscribe();

/*    if (this.route.snapshot.children[0] && this.route.snapshot.children[0].url[0].path === 'profile') {
      console.log('this.route.snapshot.children[0].url[0].path');
      console.log(this.route.snapshot.children[0].url[0].path);
    } else {
      this.navigateHome();
    }*/

    this.isComponentLoading = false;

    this.idle = this.userIdle.getConfigValue().idle;
    this.timeout = this.userIdle.getConfigValue().timeout;
    this.ping = this.userIdle.getConfigValue().ping;


    this.onStartWatching();

    // this.startAchievementPolling();
  }


  navigateHome() {
    const functionName = 'navigateHome';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.authService.currentUserInfo()
      .then(currentUser => {
        const securityRoleName = currentUser.attributes['custom:security_role'];
        switch (securityRoleName) {
          case 'employee': {
            console.log(`${functionFullName}: navigating to standard-user`);
            this.router.navigate(['/', 'user', 'homepage']);
            break;
          }
          case 'manager': {
            console.log(`${functionFullName}: navigating to manager-user`);
            this.router.navigate(['/', 'user', 'homepage']);
            break;
          }
          case 'admin': {
            console.log(`${functionFullName}: navigating to admin-user`);
            this.router.navigate(['/', 'user', 'admin-user']);
            break;
          }
        }
      });

  }

  ngOnDestroy() {
    const functionName = 'ngOnDestroy';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.alive = false; // switches your TimerObservable off


  }

/*  startAchievementPolling() {
    const functionName = 'startAchievementPolling';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    TimerObservable.create(0, this.interval)
      .takeWhile(() => this.alive)
      .subscribe(() => {
        this.departmentService.getDepartments()
          .subscribe((data: any) => {
            this.data = data;
            if (!this.display) {
              this.display = true;
            }
            console.log(Date.now());
            console.log(this.data);
          });
      });
  }*/

  onStartWatching() {
    console.log('onStartWatching');
    this.isWatching = true;
    this.timerCount = this.userIdle.getConfigValue().timeout;

    // Start watching for user inactivity.
    this.userIdle.startWatching();

    // Start watching when user idle is starting.
    this.timerStartSubscription = this.userIdle.onTimerStart()
      .pipe(tap(() => {
        this.isTimer = true;
        $('#timeOutModal').modal({backdrop: 'static'});
      }))
      .subscribe(count => {
        this.timerCount = count;
        console.log(this.timerCount);
      });

    // Start watch when time is up.
    this.timeoutSubscription = this.userIdle.onTimeout()
      .subscribe(() => {
        this.timeIsUp = true;
      });

    this.pingSubscription = this.userIdle.ping$
      .subscribe(value => {
        this.lastPing = `#${value} at ${new Date().toString()}`;
      });
  }

  onStopWatching() {
    this.userIdle.stopWatching();
    this.timerStartSubscription.unsubscribe();
    this.timeoutSubscription.unsubscribe();
    this.pingSubscription.unsubscribe();
    this.isWatching = false;
    this.isTimer = false;
    this.timeIsUp = false;
    this.lastPing = null;
  }

  onStopTimer() {
    this.userIdle.stopTimer();
    this.isTimer = false;
  }

  onResetTimer() {
    this.userIdle.resetTimer();
    this.isTimer = false;
    this.timeIsUp = false;
  }


  onLogout() {
    this.navigationService.onLogout();
  }
}
