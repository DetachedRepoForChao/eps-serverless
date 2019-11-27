import {Component, EventEmitter, HostListener, OnInit} from '@angular/core';
import {NotifierService} from 'angular-notifier';
import {MetricsService} from '../../entity-store/metrics/state/metrics.service';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {UserHasStoreItemQuery} from '../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {PointItemTransactionService} from '../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  componentName = 'homepage.component';
  currentUser$;
  pendingBalance$;

  private codeEntered: EventEmitter<boolean> = new EventEmitter<boolean>();
  private sequence: number[] = [];
  private konamiCode: number[] = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  public config: PerfectScrollbarConfigInterface = {};

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
    private notifierService: NotifierService,
    private metricsService: MetricsService,
    private currentUserService: EntityCurrentUserService,
    private currentUserQuery: EntityCurrentUserQuery,
    private storeItemService: StoreItemService,
    private userHasStoreItemService: UserHasStoreItemService,
    private userHasStoreItemQuery: UserHasStoreItemQuery,
    private achievementService: AchievementService,
    private pointItemTransactionService: PointItemTransactionService,
    private router: Router,
    private route: ActivatedRoute) {  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // if (this.socketService.onSessionCreate() != null) {
    //  console.log(this.socketService.onSessionCreate());
    //  this.notifierService.notify('success', 'Session created!');
    // }

    this.currentUser$ = this.currentUserQuery.selectAll({
      limitTo: 1
    });

    this.pendingBalance$ = this.userHasStoreItemQuery.selectAll();
    this.pendingBalance$.subscribe(() => {
      this.userHasStoreItemService.getPendingBalance().subscribe(balance => {
        console.log('balance: ' + balance);
        this.currentUserService.updatePointsBalance(balance);
      });
    });

    this.currentUserService.cacheCurrentUser().subscribe(() => {
      this.storeItemService.cacheStoreItems().subscribe(() => {
        this.userHasStoreItemService.cacheUserHasStoreItemRecords().subscribe(() => {
/*          this.userHasStoreItemService.getPendingBalance().subscribe(balance => {
            console.log('balance: ' + balance);
            this.currentUserService.updatePointsBalance(balance);
          });*/
        });
      });
    });

    this.currentUser$.subscribe((currentUser) => {
      if (currentUser[0]) {
        console.log(currentUser);
        this.metricsService.cacheMetrics().subscribe(() => {
          this.metricsService.startHomepageTimer();
        });
      }
    });

    // this.pointItemTransactionService.cacheCurrentUserPointItemTransactions().subscribe();
  }

  private isKonamiCode(): boolean {
    return this.konamiCode.every((code: number, index: number) => code === this.sequence[index]);
  }
}
