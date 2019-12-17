import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {Observable, Subject} from 'rxjs';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {PointItemTransactionModel} from '../../../entity-store/point-item-transaction/state/point-item-transaction.model';
import {GoogleChartComponent} from 'angular-google-charts';
import {Order} from '@datorama/akita';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {OtherUserAchievementService} from '../../../entity-store/other-user-achievement/state/other-user-achievement.service';
import {OtherUserAchievementQuery} from '../../../entity-store/other-user-achievement/state/other-user-achievement.query';
import {OtherUserAchievementModel} from '../../../entity-store/other-user-achievement/state/other-user-achievement.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {NavigationService} from '../../../shared/navigation.service';
import {take, takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-other-user-manager',
  templateUrl: './other-user-manager.component.html',
  styleUrls: ['./other-user-manager.component.css']
})
export class OtherUserManagerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chart') chart: GoogleChartComponent;
  @Input() inputUser: EntityUserModel;

  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private userLoading$ = new Subject();
  private achievementsLoading$ = new Subject();
  private transactionsLoading$ = new Subject();

  user$: Observable<EntityUserModel[]> = null;
  user: EntityUserModel = null;
  userId: number = null;
  pointItemTransactions$: Observable<PointItemTransactionModel[]> = null;
  pointItemTransactions: PointItemTransactionModel[] = null;
  achievements: OtherUserAchievementModel[] = null;
  completedAchievements: OtherUserAchievementModel[] = null;

  isUserDataRetrieved = false;
  pointItemsTransactionsRetrieving = false;
  achievementsRetrieving = false;


  constructor(private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private achievementService: AchievementService,
              private achievementQuery: AchievementQuery,
              private pointItemTransactionService: PointItemTransactionService,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private otherUserAchievementService: OtherUserAchievementService,
              private otherUserAchievementQuery: OtherUserAchievementQuery,
              private route: ActivatedRoute,
              private spinner: NgxSpinnerService,
              private navigationService: NavigationService,
              private router: Router) {
  }

  ngOnInit() {
/*    this.userService.cacheUsers().subscribe();
    this.achievementService.cacheAchievements().subscribe();
    this.pointItemService.cachePointItems().subscribe();*/
    this.spinner.show('other-user-manager-spinner');

    this.populateUserData();
  }

  populateUserPointTransactionData(user: EntityUserModel) {
    if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointItemsTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheManagerPointItemTransactions(user.userId)
        .pipe(take(1))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            result
              .pipe(take(1))
              .subscribe(() => {
                this.pointItemTransactionQuery.selectLoading()
                  .pipe(takeUntil(this.transactionsLoading$))
                  .subscribe(isLoading => {
                    if (!isLoading) {
                      this.pointItemTransactionQuery.selectAll({
                        filterBy: e => e.sourceUserId === user.userId,
                        sortBy: 'createdAt',
                        sortByOrder: Order.DESC
                      })
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe((transactions: PointItemTransactionModel[]) => {
                          this.pointItemTransactions = transactions;
                          // console.log('point item transactions');
                          // console.log(this.pointItemTransactions);
                        });

                      this.transactionsLoading$.next();
                      this.transactionsLoading$.complete();
                    }
                  });
              });

          } else {
            // console.log(`Cache User Point Item Transactions returned ${result}`);
            // We may have retrieved the data but the pointItemTransactions variable may be null... this accounts for that
            this.pointItemTransactionQuery.selectLoading()
              .pipe(takeUntil(this.transactionsLoading$))
              .subscribe(isLoading => {
                if (!isLoading) {
                  this.pointItemTransactionQuery.selectAll({
                    filterBy: e => e.sourceUserId === user.userId,
                    sortBy: 'createdAt',
                    sortByOrder: Order.DESC
                  })
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((transactions: PointItemTransactionModel[]) => {
                      this.pointItemTransactions = transactions;
                      // console.log('point item transactions');
                      // console.log(this.pointItemTransactions);
                    });

                  this.transactionsLoading$.next();
                  this.transactionsLoading$.complete();
                }
              });
          }
        });
    } else {
      // console.log(`Already retrieving point item transactions`);
    }
  }


  populateUserAchievementData(user: EntityUserModel) {
    if (!this.achievementsRetrieving) { // This check prevents the API call from firing more than it has to
      this.achievementsRetrieving = true;
      this.otherUserAchievementService.cacheAchievements(user)
        .pipe(take(1))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            result
              .pipe(take(1))
              .subscribe(() => {
                this.otherUserAchievementQuery.selectLoading()
                  .pipe(takeUntil(this.achievementsLoading$))
                  .subscribe(isLoading => {
                    if (!isLoading) {
                      this.otherUserAchievementQuery.selectAll({
                        filterBy: e => e.userId === user.userId,
                        sortBy: 'updatedAt',
                        sortByOrder: Order.DESC
                      })
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe((achievements: OtherUserAchievementModel[]) => {
                          this.achievements = achievements;
                          // console.log('achievements');
                          // console.log(this.achievements);
                        });

                      this.otherUserAchievementQuery.selectAll({
                        filterBy: e => (e.userId === user.userId) && ((e.progressStatus === 'complete') || (e.progressStatus === 'complete acknowledged')),
                        sortBy: 'updatedAt',
                        sortByOrder: Order.DESC
                      })
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe((achievements: OtherUserAchievementModel[]) => {
                          this.completedAchievements = achievements;
                          // console.log('completed achievements');
                          // console.log(this.completedAchievements);
                        });

                      this.achievementsLoading$.next();
                      this.achievementsLoading$.complete();
                    }
                  });
              });

          } else {
            // console.log(`Cache Achievements returned ${result}`);
            // We may have retrieved the data but the achievements or completedAchievements variables may be null...
            // this accounts for that...

            this.otherUserAchievementQuery.selectLoading()
              .pipe(takeUntil(this.achievementsLoading$))
              .subscribe(isLoading => {
                if (!isLoading) {
                  this.otherUserAchievementQuery.selectAll({
                    filterBy: e => e.userId === user.userId,
                    sortBy: 'updatedAt',
                    sortByOrder: Order.DESC
                  })
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((achievements: OtherUserAchievementModel[]) => {
                      this.achievements = achievements;
                      // console.log('achievements');
                      // console.log(this.achievements);
                    });

                  this.otherUserAchievementQuery.selectAll({
                    filterBy: e => (e.userId === user.userId) && ((e.progressStatus === 'complete') || (e.progressStatus === 'complete acknowledged')),
                    sortBy: 'updatedAt',
                    sortByOrder: Order.DESC
                  })
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((achievements: OtherUserAchievementModel[]) => {
                      this.completedAchievements = achievements;
                      // console.log('completed achievements');
                      // console.log(this.completedAchievements);
                    });

                  this.achievementsLoading$.next();
                  this.achievementsLoading$.complete();
                }
              });
          }
        });
    } else {
      // console.log(`Already retrieving achievements`);
    }
  }

  populateUserData() {
    this.userQuery.selectLoading()
      .pipe(takeUntil(this.userLoading$))
      .subscribe(userQueryLoading => {
        // console.log(`User loading status is ${userQueryLoading}`);
        if (!userQueryLoading) {
          this.userQuery.selectUserByUsername(this.route.snapshot.params.username)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user: EntityUserModel) => {
              this.user = user;
              this.populateUserPointTransactionData(user);
              this.populateUserAchievementData(user);

              this.isUserDataRetrieved = true;
              this.spinner.hide('other-user-manager-spinner');
            });

          this.userLoading$.next();
          this.userLoading$.complete();
        } else {
          // console.log('ERROR: User is still loading');
        }
      });
  }

  showPointsModal() {
    // console.log(`invoking points modal with the following user input:`);
    // console.log(this.user);
    this.navigationService.pointItemComponentInputUser = this.user;
    this.navigationService.openPointItemModal();
  }

  showAchievementsModal() {
    // console.log(`invoking achievements modal with the following user input:`);
    // console.log(this.user);
    this.navigationService.achievementComponentInputUser = this.user;
    this.navigationService.openAchievementModal();
  }




  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);

    if (changes) {
      // console.log('clearing all variables');

      this.user$ = null;
      this.user = null;
      this.pointItemTransactions$ = null;
      this.pointItemTransactions = null;
      this.achievements = null;
      this.completedAchievements = null;
      this.isUserDataRetrieved = false;
      this.pointItemsTransactionsRetrieving = false;
      this.achievementsRetrieving = false;

      // console.log('on changes input user:');
      // console.log(this.inputUser);

      // console.log('on changes populating data');

      this.populateUserData();
    }
  }

  ngOnDestroy(): void {
    // console.log('ngOnDestroy');
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.userLoading$.next();
    this.userLoading$.complete();
    this.achievementsLoading$.next();
    this.achievementsLoading$.complete();
    this.transactionsLoading$.next();
    this.transactionsLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
