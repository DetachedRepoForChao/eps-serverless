import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { SecurityRoleService} from '../shared/securityRole.service';
import {map, takeUntil} from 'rxjs/operators';
import { UserIdleService } from 'angular-user-idle';
import { tap } from 'rxjs/operators';
import {take} from 'rxjs/operators';
import {forkJoin, Observable, Subject, Subscription} from 'rxjs';
import {AuthService} from '../login/auth.service';
import {Auth, Storage} from 'aws-amplify';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {FeedcardService} from '../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import 'rxjs/add/operator/takeWhile';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {AchievementService} from '../entity-store/achievement/state/achievement.service';
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
import {EntityCurrentUserModel} from '../entity-store/current-user/state/entity-current-user.model';
import {EntityCurrentUserQuery} from '../entity-store/current-user/state/entity-current-user.query';

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
  private currentUserLoading$ = new Subject();
  private unsubscribe$ = new Subject();

  constructor(private router: Router,
              private securityRoleService: SecurityRoleService,
              private route: ActivatedRoute,
              private userIdle: UserIdleService,
              private http: HttpClient,
              private authService: AuthService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
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
              private currentUserQuery: EntityCurrentUserQuery,
              private navigationService: NavigationService) {
    this.display = false;
    this.alive = true;
    this.interval = 10000;
  }

  ngOnInit() {
    // const functionName = 'ngOnInit';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log('route');
    // console.log(this.route);
    // console.log('this.route.snapshot');
    // console.log(this.route.snapshot);

    this.achievementService.cacheAchievements()
      .pipe(take(1))
      .subscribe();

    this.departmentService.cacheDepartments()
      .pipe(take(1))
      .subscribe();

    Auth.currentUserInfo()
      .then(userAttributes => {
        if (+userAttributes.attributes['custom:security_role_id'] === 3) {
          this.userService.cacheUsersAdmin()
            .pipe(take(1))
            .subscribe();
        } else {
          this.userService.cacheUsers()
            .pipe(take(1))
            .subscribe();
        }
      });

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

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        // console.log('current user loading: ' + isLoading);
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.pointItemTransactionService.cacheUserPointItemTransactions(currentUser.userId)
                .pipe(take(1))
                .subscribe((result: Observable<any> | any) => {
                  if (result !== false) {
                    result
                      .pipe(take(1))
                      .subscribe(() => {
                      });

                  } else {
                    // console.log(`Cache User Point Item Transactions returned ${result}`);
                  }
                });
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });
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



  ngOnDestroy() {
    // const functionName = 'ngOnDestroy';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    this.alive = false; // switches your TimerObservable off

    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

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
    // console.log('onStartWatching');
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
        // console.log(this.timerCount);
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
