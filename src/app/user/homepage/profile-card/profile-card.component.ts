import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject, Subscription} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
// import {AchievementService} from '../../../shared/achievement/achievement.service';
import {UserService} from '../../../shared/user.service';
import {CurrentUserStore} from '../../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {MetricsService} from '../../../entity-store/metrics/state/metrics.service';
import {AuthService} from '../../../login/auth.service';
import {UserHasStoreItemQuery} from '../../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {FeatureService} from '../../../entity-store/feature/state/feature.service';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {Router} from '@angular/router';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {Order} from '@datorama/akita';
import {AchievementModel} from '../../../entity-store/achievement/state/achievement.model';
import {takeUntil} from 'rxjs/operators';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  componentName = 'profile-card.component';
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private usersLoading$ = new Subject();
  private achievementsLoading$ = new Subject();
  subscription = new Subscription();
  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;
  leaderboardUsers: EntityUserModel[];
  leaderboardUsersSubscription: Subscription;
  pendingBalance$;
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  currentUserSubscription: Subscription;
  finishedAchievements: AchievementModel[];
  achievements: AchievementModel[];
  achievementsSubscription: Subscription;
  pointItemTransactions$;
  isCardLoading: boolean;

  constructor(private router: Router,
              private imageService: ImageService,
              private leaderboardService: LeaderboardService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private userService: UserService,
              private currentUserStore: CurrentUserStore,
              public currentUserQuery: EntityCurrentUserQuery,
              private entityCurrentUserService: EntityCurrentUserService,
              private sanitizer: DomSanitizer,
              private entityUserService: EntityUserService,
              private userQuery: EntityUserQuery
              ) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-spinner');

    this.currentUserQuery.selectLoading()
        .pipe(takeUntil(this.currentUserLoading$))
        .subscribe(isLoading => {
          if (!isLoading) {
            this.currentUserQuery.selectCurrentUser()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((currentUser: EntityCurrentUserModel) => {
                  console.log('Current user changed', currentUser);
                  this.currentUser = currentUser;
                });

            this.currentUserLoading$.next();
            this.currentUserLoading$.complete();
          }
        });

    this.userQuery.selectLoading()
        .pipe(takeUntil(this.usersLoading$))
        .subscribe(isLoading => {
          if (!isLoading) {
            this.userQuery.selectAll({
              filterBy: e => e.securityRole.Id === 1,
              sortBy: 'points',
              sortByOrder: Order.DESC
            })
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((users: EntityUserModel[]) => {
                  this.leaderboardUsers = users;
                });

            this.usersLoading$.next();
            this.usersLoading$.complete();
          }
        });

    this.achievementQuery.selectLoading()
        .pipe(takeUntil(this.usersLoading$))
        .subscribe(isLoading => {
          if (!isLoading) {
            this.achievementQuery.selectAll()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((achievements: AchievementModel[]) => {
                  this.achievements = achievements;
                });

            this.achievementQuery.selectFinishedAchievements()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((finishedAchievements: AchievementModel[]) => {
                  this.finishedAchievements = finishedAchievements;
                });

            this.achievementsLoading$.next();
            this.achievementsLoading$.complete();
          }
        });


    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('profile-card-spinner');
  }

  avatarClick() {
    $('#avatarModal').modal('show');
  }

  onSetQuoteClick(username: string) {
    this.router.navigate(['user', 'profile', username], {state: {option: 'quote'}});
  }

  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.usersLoading$.next();
    this.usersLoading$.complete();
    this.achievementsLoading$.next();
    this.achievementsLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
