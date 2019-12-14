import {Component, OnDestroy, OnInit} from '@angular/core';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {Pointtransaction} from '../../../shared/feedcard/pointtransaction';
import {PointTransaction} from '../../../shared/feedcard/feedcard.service';
import {User} from '../../../shared/user.model';
import {LeaderboardUser} from '../../../shared/leaderboard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Globals} from '../../../globals';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {UserStore} from '../../../entity-store/user/state/user.store';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {Observable, Subject, Subscription} from 'rxjs';
import {PointItemTransactionModel} from '../../../entity-store/point-item-transaction/state/point-item-transaction.model';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {Order} from '@datorama/akita';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {take, takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnDestroy {
  componentName = 'feed.component';
  private subscription = new Subscription();
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private userLoading$ = new Subject();
  private transactionsLoading$ = new Subject();
  users: EntityUserModel[];
  isCardLoading: boolean;
  pointItemTransactions$: Observable<PointItemTransactionModel[]>;
  pointItemTransactions: PointItemTransactionModel[];
  pointTransactionsRetrieving = false;
  // numBatchRetrieved = 0;


  constructor(private spinner: NgxSpinnerService,
              private router: Router,
              private entityUserService: EntityUserService,
              private userStore: UserStore,
              private userQuery: EntityUserQuery,
              private achievementService: AchievementService,
              public pointItemTransactionService: PointItemTransactionService,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    console.log(`${functionFullName}: showing feed-card-spinner`);
    this.spinner.show('feed-card-spinner');

    // this.entityUserService.cacheUsers().subscribe();
    // this.pointItemService.cachePointItems().subscribe();

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.userLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.users = users;
            });

          this.userLoading$.next();
          this.userLoading$.complete();
        }
      });

    if (!this.pointItemTransactionService.initialBatchRetrieved) {
      console.log('Invoking populatePointTransactionData()');
      this.populatePointTransactionData();
    }

    this.pointItemTransactionQuery.selectLoading()
      .pipe(takeUntil(this.transactionsLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.pointItemTransactionQuery.selectAllAddTransactions()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((transactions: PointItemTransactionModel[]) => {
              this.pointItemTransactions = transactions;
              console.log('point item transactions');
              console.log(this.pointItemTransactions);
            });


          this.transactionsLoading$.next();
          this.transactionsLoading$.complete();
        }

      });

    this.isCardLoading = false;
    console.log(`${functionFullName}: hiding feed-card-spinner`);
    this.spinner.hide('feed-card-spinner');
  }


  populatePointTransactionData() {
    if (!this.pointTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheAddPointItemTransactionsBatch()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            console.log('Received observable response... subscribing...');
            result
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((response) => {
              console.log('Subscribed to point transaction caching...');
              console.log(response);

            });

            this.pointItemTransactionService.setInitialBatchRetrievedTrue();

          } else {
            console.log(`Cache Point Item Transactions returned ${result}`);
          }
        });
    } else {
      console.log(`Already retrieving point item transactions`);
    }
  }

  onLikeClick(pointTransaction: PointItemTransactionModel) {
    const functionName = 'onLikeClick';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.pointItemTransactionService.addLike(pointTransaction.targetUserId, pointTransaction.transactionId)
      .pipe(take(1))
      .subscribe(() => {
      this.achievementService.incrementAchievement('LikePost')
        .pipe(take(1))
        .subscribe();
    });
  }

  onUnlikeClick(pointTransaction: PointItemTransactionModel) {
    const functionName = 'onUnlikeClick';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.pointItemTransactionService.removeLike(pointTransaction.transactionId)
      .pipe(take(1))
      .subscribe(() => {
      this.achievementService.incrementAchievement('UnlikePost')
        .pipe(take(1))
        .subscribe();
    });
  }

  loadMore() {
    console.log('loading next batch of posts');
    this.pointItemTransactionService.cacheAddPointItemTransactionsBatch()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result !== false) {
          console.log('Received observable response... subscribing...');
          result
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => {
            console.log('Subscribed to point transaction caching...');
            console.log(response);

            console.log(`loaded batch ${this.pointItemTransactionService.numBatchRetrieved}`);
          });


        } else {
          console.log(`Cache Point Item Transactions returned ${result}`);
        }
      });
  }

  onUserClick(userId: number) {
    const user = this.userQuery.getUserByUserId(userId);
    this.router.navigate(['/', 'user', 'profile', user.username]);
  }

  function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
    fjs.parentNode.insertBefore(js, fjs);
  }

  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.userLoading$.next();
    this.userLoading$.complete();
    this.transactionsLoading$.next();
    this.transactionsLoading$.complete();
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
