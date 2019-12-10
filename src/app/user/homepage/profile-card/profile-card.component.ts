import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
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

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  componentName = 'profile-card.component';
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

  constructor(private http: HttpClient,
              private router: Router,
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
              private entityUserQuery: EntityUserQuery,
              private userHasStoreItemService: UserHasStoreItemService,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private storeItemService: StoreItemService,
              private metricsService: MetricsService,
              private authService: AuthService,
              private changeDetector: ChangeDetectorRef,
              private featureService: FeatureService,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemTransactionService: PointItemTransactionService
              ) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-spinner');

    this.entityUserService.cacheUsers().subscribe();
    this.pointItemService.cachePointItems().subscribe();
    this.achievementService.cacheAchievements().subscribe();

    this.currentUser$ = this.currentUserQuery.selectAll();

    // this.featureService.cacheFeatures().subscribe().unsubscribe();
    this.leaderboardUsers$ = this.entityUserQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });



    this.currentUserSubscription = this.currentUserQuery.selectAll()
      .subscribe(currentUser => {
        this.currentUser = currentUser[0];
      });

    this.leaderboardUsersSubscription = this.entityUserQuery.selectAll({
      filterBy: e => e.securityRole.Id === 1,
      sortBy: 'points',
      sortByOrder: Order.DESC
    })
      .subscribe(users => {
        this.leaderboardUsers = users;
      });

    this.achievementsSubscription = this.achievementQuery.selectAll()
      .subscribe(achievements => {
        this.achievements = achievements;
        this.finishedAchievements = this.achievementQuery.getFinishedAchievements();
      });

    // this.pendingBalance$ = this.entityCurrentUserService.getPendingBalance();
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
    this.currentUserSubscription.unsubscribe();
    this.leaderboardUsersSubscription.unsubscribe();
    this.achievementsSubscription.unsubscribe();
  }
}
