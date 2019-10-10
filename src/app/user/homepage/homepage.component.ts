import {Component, EventEmitter, HostListener, OnInit} from '@angular/core';
import {SocketService} from '../../shared/socket.service';
import {NotifierService} from 'angular-notifier';
import {Globals} from '../../globals';
import {MetricsService} from '../../entity-store/metrics/state/metrics.service';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  // styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  componentName = 'homepage.component';
  globalService;

  private codeEntered: EventEmitter<boolean> = new EventEmitter<boolean>();
  private sequence: number[] = [];
  private konamiCode: number[] = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode) {
      console.log(event.keyCode);
      console.log(this.sequence);
      console.log(this.isKonamiCode());
      this.sequence.push(event.keyCode);

      if (this.sequence.length > this.konamiCode.length) {
        this.sequence.shift();
      }

      if (this.isKonamiCode()) {
        console.log('success');
        this.codeEntered.emit(true);
        this.achievementService.incrementAchievement('RetroGamer').subscribe();
      } else {
        this.codeEntered.emit(false);
      }
    }
  }

  constructor(
    private socketService: SocketService,
    private notifierService: NotifierService,
    public globals: Globals,
    private metricsService: MetricsService,
    private currentUserService: EntityCurrentUserService,
    private currentUserQuery: EntityCurrentUserQuery,
    private storeItemService: StoreItemService,
    private userHasStoreItemService: UserHasStoreItemService,
    private achievementService: AchievementService) { }

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

            this.storeItemService.cacheStoreItems().subscribe(() => {
              this.userHasStoreItemService.cacheUserHasStoreItemRecords().subscribe(() => {
                this.userHasStoreItemService.getPendingBalance().subscribe(balance => {
                  console.log('balance: ' + balance);
                  this.currentUserService.updatePointsBalance(balance);
                });
              });
            });
          }
        });
    });
  }

  private isKonamiCode(): boolean {
    return this.konamiCode.every((code: number, index: number) => code === this.sequence[index]);
  }
}
