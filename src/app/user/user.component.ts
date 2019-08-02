import {Component, OnInit} from '@angular/core';
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
import {Storage} from 'aws-amplify';
import * as Amplify from 'aws-amplify';
// import * as AWS from 'aws-sdk/global';
// import * as S3 from 'aws-sdk/clients/s3';
import * as AWS from 'aws-sdk';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {SecurityRole} from '../shared/securityrole.model';
import {FeedcardService} from '../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {GiftPointsService} from './manager-user/gift-points/gift-points.service';

declare var $: any;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  componentName = 'user.component';
  securityRole;
  securityRoleId;
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
              private giftPointsService: GiftPointsService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: Showing user-component-spinner`);
    // this.spinner.show('user-component-spinner');
/*    if (this.sessionService.GetSessionProperty('backendSessionConnected') === false) {
      this.socketService.reinitialize();

      this.sessionService.CreateSessionCreatedListener();
      this.sessionService.CreateSessionHeartbeatListener();
      this.sessionService.CreateSessionDisconnectedListener();
    } else if (this.sessionService.GetSessionProperty('backendSessionConnected') === true) {
      // Reuse the same session. No need to recreate any listeners
    } else {
      // if the 'backendSessionConnected' field doesn't exist
      this.sessionService.CreateSessionCreatedListener();
      this.sessionService.CreateSessionHeartbeatListener();
      this.sessionService.CreateSessionDisconnectedListener();
    }

    // Initialize session if it has not been initialized yet
    if (!(this.sessionService.GetSessionProperty('initialized'))) {
      this.sessionService.CreateSession();
    }*/

    // this.departmentService.storeDepartments();
    // this.securityRoleId = +this.route.snapshot.paramMap.get('id');
    this.securityRoleId = +localStorage.getItem('securityRoleId');

    const observables: Observable<any>[] = [];


    if (!this.securityRoleId) {
      // observables.push(this.userService.getUserProfile());
      this.userService.getUserProfile()
        .subscribe((userData: any) => {
          this.securityRoleId = userData.securityRoleId;
          localStorage.setItem('securityRoleId', userData.securityRoleId);

          observables.push(this.securityRoleService.getSecurityRoleById(this.securityRoleId));
        });
    } else {
      observables.push(this.securityRoleService.getSecurityRoleById(this.securityRoleId));
    }


/*      .subscribe((securityRole: SecurityRole) => {
        this.securityRole = securityRole;

        switch (this.securityRole.Name) {
          case 'employee': {
            console.log(`${functionFullName}: navigating to standard-user`);
            // this.router.navigate(['standard-user']);
            this.router.navigate(['homepage']);
            break;
          }
          case 'manager': {
            console.log(`${functionFullName}: navigating to manager-user`);
            // this.router.navigate(['manager-user']);
            this.router.navigate(['homepage']);
            break;
          }
          case 'admin': {
            console.log(`${functionFullName}: navigating to admin-user`);
            this.router.navigate(['admin-user']);
            break;
          }
        }
      });*/

    forkJoin(observables)
      .subscribe(obsResults => {
        console.log(`${functionFullName}: obsResults:`);
        console.log(obsResults);

        // Iterate over the returned values from the observables so we can act appropriately on each
        obsResults.forEach(obsResult => {
          console.log(`${functionFullName}: obsResult:`);
          console.log(obsResult);

          // Act on observable value that was returned from userService.getUserProfile()
/*          if (obsResult.securityRoleId) {
            console.log(`${functionFullName}: obsResult.securityRoleId: ${obsResult.securityRoleId}`);
            this.securityRoleId = obsResult.securityRoleId;
            localStorage.setItem('securityRoleId', obsResult.securityRoleId);
          } else */if (obsResult.Name) { // observable value returned from securityRoleService.getSecurityRoleById()
            console.log(`${functionFullName}: obsResult.Name: ${obsResult.Name}`);
            this.securityRole = obsResult;

            switch (this.securityRole.Name) {
              case 'employee': {
                console.log(`${functionFullName}: navigating to standard-user`);
                // this.router.navigate(['standard-user']);
                this.router.navigate(['homepage']);
                break;
              }
              case 'manager': {
                console.log(`${functionFullName}: navigating to manager-user`);
                // this.router.navigate(['manager-user']);
                this.router.navigate(['homepage']);
                break;
              }
              case 'admin': {
                console.log(`${functionFullName}: navigating to admin-user`);
                this.router.navigate(['admin-user']);
                break;
              }
            }
          }
        });

        this.isComponentLoading = false;
        // console.log(`${functionFullName}: Hiding user-component-spinner`);
        // this.spinner.hide('user-component-spinner');
      });

    this.idle = this.userIdle.getConfigValue().idle;
    this.timeout = this.userIdle.getConfigValue().timeout;
    this.ping = this.userIdle.getConfigValue().ping;

    this.onStartWatching();
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
    this.feedcardService.refreshPointTransactionAvatars();
    // this.socketService.socketTest2();
    // debugger;
    // console.log(this.socketService.sessionHash);
    // console.log(this.socketService.socket);
    // this.sessionService.getServerIo().subscribe(() => {});
  }

}
