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
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
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
              private departmentService: DepartmentService) { }

  ngOnInit() {
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

    if (!this.securityRoleId) {
      this.userService.getUserProfile()
        .then(userData => {
          this.securityRoleId = userData['user'].securityRoleId;
          localStorage.setItem('securityRoleId', userData['user'].securityRoleId);
        });
    }

    this.securityRoleService.getSecurityRoleById(this.securityRoleId)
      .then(securityRole => {
        this.securityRole = securityRole;

        switch (this.securityRole.name) {
          case 'employee': {
            console.log('navigating to standard-user');
            // this.router.navigate(['standard-user']);
            this.router.navigate(['homepage']);
            break;
          }
          case 'manager': {
            console.log('navigating to manager-user');
            // this.router.navigate(['manager-user']);
            this.router.navigate(['homepage']);
            break;
          }
          case 'admin': {
            console.log('navigating to admin-user');
            this.router.navigate(['admin-user']);
            break;
          }

        }
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


  storeSecurityRole() {
    const securityRoleId = +localStorage.getItem('securityRoleId');
    return this.securityRoleService.getSecurityRoleById(securityRoleId)
      .then(data => {
        if ( !data) {
          console.log('Did not receive valid security role data');
          return false;
        } else {
          console.log('Received valid security role data');
          debugger;
          localStorage.setItem('securityRoleName', data.name);
          localStorage.setItem('securityRoleDescription', data.description);
          return data;
        }

      });
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

  onProfileClick() {
    this.router.navigate(['/profile']);
  }

  onSocketTestClick1() {
    // this.socketService.socketTest1();
    // this.socketService.emit('Test1');
  }

  onSocketTestClick2() {
    // this.socketService.socketTest2();
    // debugger;
    //console.log(this.socketService.sessionHash);
    // console.log(this.socketService.socket);
    // this.sessionService.getServerIo().subscribe(() => {});
  }

}
