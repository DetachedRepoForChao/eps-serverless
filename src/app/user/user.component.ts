import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { DepartmentService } from '../shared/department.service';
import { SecurityRoleService} from '../shared/securityRole.service';
import {map} from 'rxjs/operators';
import { Globals } from '../globals';
// import {SocketService} from '../shared/socket.service';
import {GlobalVariableService} from '../shared/global-variable.service';
// import {SessionService} from '../shared/session.service';
import { UserIdleService } from 'angular-user-idle';
import { tap } from 'rxjs/operators';
import {forkJoin, Observable, Subscription} from 'rxjs';
import {AuthService} from '../login/auth.service';
import {Auth, Storage} from 'aws-amplify';
import * as Amplify from 'aws-amplify';
// import * as AWS from 'aws-sdk/global';
// import * as S3 from 'aws-sdk/clients/s3';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {SecurityRole} from '../shared/securityrole.model';
import {FeedcardService} from '../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {GiftPointsService} from './manager-user/gift-points/gift-points.service';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import 'rxjs/add/operator/takeWhile';
import {AchievementService} from '../shared/achievement/achievement.service';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';

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

  constructor(private globals: Globals,
              private userService: UserService,
              private router: Router,
              private securityRoleService: SecurityRoleService,
              private route: ActivatedRoute,
              // private socketService: SocketService,
              private globalVariableService: GlobalVariableService,
              // private sessionService: SessionService,
              private userIdle: UserIdleService,
              private departmentService: DepartmentService,
              private http: HttpClient,
              private authService: AuthService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
              private giftPointsService: GiftPointsService,
              private achievementService: AchievementService) {
    this.display = false;
    this.alive = true;
    this.interval = 10000;
  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.securityRoleName = this.globals.getUserAttribute('custom:security_role');

    this.navigateHome();
/*    if (this.router.url.includes('homepage')) {
      this.navigateHome();
    }*/
    // console.log(this.router);
    // console.log(this.route);
    // console.log(this.route.children);

    // this.navigateHome();

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

    switch (this.securityRoleName) {
      case 'employee': {
        console.log(`${functionFullName}: navigating to standard-user`);
        // this.router.navigate(['standard-user']);
        console.log(this.router);
        console.log(this.router.getCurrentNavigation());
        // console.log(this.router.)
        this.router.navigate(['user', 'homepage']);
        // this.router.navigate([{ outlets: { 'user-page': ['user/homepage']}}]);
        break;
      }
      case 'manager': {
        console.log(`${functionFullName}: navigating to manager-user`);
        // this.router.navigate(['manager-user']);
        this.router.navigate(['user', 'homepage']);
        // this.router.navigate([{ outlets: { 'user-page': ['homepage']}}]);
        break;
      }
      case 'admin': {
        console.log(`${functionFullName}: navigating to admin-user`);
        this.router.navigate(['user', 'admin-user']);
        // this.router.navigate([{ outlets: { 'user-page': ['admin-user']}}]);
        break;
      }
    }
  }

  ngOnDestroy() {
    const functionName = 'ngOnDestroy';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.alive = false; // switches your TimerObservable off


  }

  startAchievementPolling() {
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
  }

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
      .subscribe(() => this.timeIsUp = true);

    this.pingSubscription = this.userIdle.ping$
      .subscribe(value => this.lastPing = `#${value} at ${new Date().toString()}`);
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
    // const sessionId = localStorage.getItem('socketSessionId');
    this.userService.deleteToken();
    this.globalVariableService.resetAllVariables();
    // this.socketService.removeAlListeners();
    // this.socketService.destroySession(sessionId);
    // this.socketService.logoutSession();
    // this.sessionService.LogoutSession();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onCognitoLogout() {
    this.authService.signOut();
  }

  publicImage: any;
  privateImage: any;

  onTestClick3() {
    // console.log(Storage);
/*    Storage.get('aquaman@3x.png', )
    // Storage.list('')
      .then(result => {

        console.log(result);
      });*/



    Storage.get('pic-7.png')
    // Storage.list('')
      .then(result => {
        console.log('storage get public result:');
        console.log(result);

        this.http.get(result.toString(), {
          responseType: 'blob'
        })
          .subscribe(res => {
            console.log('http get publicImage:');
            console.log(res);

            const reader = new FileReader();
            reader.addEventListener('load', () => {
              this.publicImage = reader.result;
              console.log(reader.result);
            }, false);

            reader.readAsDataURL(res);

          });
      })
      .catch(err => {
        console.log('public error:');
        console.log(err);
      });

    Storage.get('pic-7.png', {
      level: 'private'
    })
    // Storage.list('')
      .then(result => {
        console.log('storage get private result:');
        console.log(result);

        this.http.get(result.toString(), {
          responseType: 'blob'
        })
          .subscribe(res => {
            console.log('http get privateImage:');
            console.log(res);

            const reader = new FileReader();
            reader.addEventListener('load', () => {
              this.privateImage = reader.result;
              console.log(reader.result);
            }, false);

            reader.readAsDataURL(res);
          });
      })
      .catch(err => {
        console.log('public error:');
        console.log(err);
      });
  }

/*  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.userAvatarImageToShow = reader.result;
      console.log(reader.result);
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }*/

  encode(data) {
    const str = data.reduce(function(a, b) { return a + String.fromCharCode(b); }, '');
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
  }

  onTestClick4() {
    Storage.list('', {
      level: 'protected'
    }).then(result => {
      console.log(result);
    });


  }

  onProfileClick() {
    this.router.navigate(['/profile']);
  }

  spinnerOn = false;

  onSocketTestClick1() {
/*    console.log('TestClick1');
    console.log(Storage);
    console.log(Amplify);*/
/*    if (this.spinnerOn) {
      this.spinner.hide('profile-card-spinner');
      this.spinnerOn = false;
    } else {
      this.spinner.show('profile-card-spinner');
      this.spinnerOn = true;
    }*/
    this.giftPointsService.populateEmployeeDataSource().subscribe((result) => {

      console.log(`setting isCardLoading to false: ${result}`);
      // this.isCardLoading = false;
      // this.spinner.hide('gift-points-spinner');
    });
  }

  onSocketTestClick2() {
    // this.feedcardService.refreshPointTransactionAvatars();
    // this.socketService.socketTest2();
    // debugger;
    // console.log(this.socketService.sessionHash);
    // console.log(this.socketService.socket);
    // this.sessionService.getServerIo().subscribe(() => {});
  }

}
