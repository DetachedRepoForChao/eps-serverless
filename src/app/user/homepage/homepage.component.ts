import { Component, OnInit } from '@angular/core';
import {SocketService} from '../../shared/socket.service';
import {NotifierService} from 'angular-notifier';
import {Globals} from '../../globals';
import {MetricsService} from '../../entity-store/metrics/state/metrics.service';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  // styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  componentName = 'homepage.component';
  globalService;

  constructor(
    private socketService: SocketService,
    private notifierService: NotifierService,
    public globals: Globals,
    private metricsService: MetricsService,
    private currentUserService: EntityCurrentUserService,
    private currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.globalService = this.globals;
    // if (this.socketService.onSessionCreate() != null) {
    //  console.log(this.socketService.onSessionCreate());
    //  this.notifierService.notify('success', 'Session created!');
    // }

    this.currentUserService.cacheCurrentUser().subscribe(() => {
      this.currentUserService.fillRemainingAttributes()
        .subscribe(result => {
          if (result === true) {
            this.currentUserQuery.getCurrentUser()
              .subscribe((currentUser: any) => {
                console.log(`${functionFullName}: current user:`);
                console.log(currentUser);
                this.metricsService.cacheMetrics().subscribe(() => {
                  this.metricsService.startHomepageTimer();
                });
              });
          }
        });
    });


  }

}
