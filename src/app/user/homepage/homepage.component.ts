import {Component, EventEmitter, HostListener, OnDestroy, OnInit} from '@angular/core';
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
import {Observable, Subject, Subscription} from 'rxjs';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {take, takeUntil} from 'rxjs/operators';
import {NavigationService} from '../../shared/navigation.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  componentName = 'homepage.component';
  subscription = new Subscription();
  unsubscribe$ = new Subject();
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  currentUserSubscription: Subscription;
  pendingBalance$;
  pendingBalanceSubscription: Subscription;
  currentUserLoading$ = new Subject();

  scrolledToGiftPointsComponent = false;

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
        this.achievementService.incrementAchievement('RetroGamer')
          .pipe(take(1))
          .subscribe();
      } else {
        this.codeEntered.emit(false);
      }
    }
  }

  constructor(
    private notifierService: NotifierService,
    private metricsService: MetricsService,
    private currentUserService: EntityCurrentUserService,
    public currentUserQuery: EntityCurrentUserQuery,
    private storeItemService: StoreItemService,
    private userHasStoreItemService: UserHasStoreItemService,
    private userHasStoreItemQuery: UserHasStoreItemQuery,
    private achievementService: AchievementService,
    private pointItemTransactionService: PointItemTransactionService,
    private navigationService: NavigationService,
    private router: Router,
    private route: ActivatedRoute) {  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);


    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          console.log('current user loaded');
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              console.log('current user', currentUser);
              this.currentUser = currentUser;

              if (currentUser.securityRole.Id === 2 && !this.scrolledToGiftPointsComponent) {
                console.log('scrolling into view');
                this.scrolledToGiftPointsComponent = true;

                Observable.interval(2000)
                  .pipe(take(1))
                  .subscribe(() => {

                    this.scrollToGiftPointsComponent();
                  });
              }
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });


  }

  private isKonamiCode(): boolean {
    return this.konamiCode.every((code: number, index: number) => code === this.sequence[index]);
  }

  scrollToGiftPointsComponent() {
    // console.log(el);
    const target = document.getElementById('gift-points-scroll-anchor');
    console.log(target);
    target.scrollIntoView({behavior: 'smooth'});
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    // this.currentUserSubscription.unsubscribe();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
