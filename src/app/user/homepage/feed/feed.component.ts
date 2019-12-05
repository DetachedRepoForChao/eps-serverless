import { Component, OnInit } from '@angular/core';
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
import {Observable} from 'rxjs';
import {PointItemTransactionModel} from '../../../entity-store/point-item-transaction/state/point-item-transaction.model';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {Order} from '@datorama/akita';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  componentName = 'feed.component';
  isCardLoading: boolean;
  pointItemTransactions$: Observable<PointItemTransactionModel[]>;
  pointItemTransactions: PointItemTransactionModel[];
  pointTransactionsRetrieving = false;
  // numBatchRetrieved = 0;


  constructor(private spinner: NgxSpinnerService,
              private globals: Globals,
              private entityUserService: EntityUserService,
              private userStore: UserStore,
              private entityUserQuery: EntityUserQuery,
              private achievementService: AchievementService,
              private pointItemTransactionService: PointItemTransactionService,
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

    this.entityUserService.cacheUsers().subscribe();
    this.pointItemService.cachePointItems().subscribe();

    if (!this.pointItemTransactionService.initialBatchRetrieved) {
      console.log('Invoking populatePointTransactionData()');
      this.populatePointTransactionData();
    }

/*    this.feedcardService.populatePointTransactions().subscribe(() => {
      this.isCardLoading = false;
      console.log(`${functionFullName}: hiding feed-card-spinner`);
      this.spinner.hide('feed-card-spinner');
    });*/

    this.isCardLoading = false;
    console.log(`${functionFullName}: hiding feed-card-spinner`);
    this.spinner.hide('feed-card-spinner');
  }


  populatePointTransactionData() {
    if (!this.pointTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheAddPointItemTransactionsBatch()
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            console.log('Received observable response... subscribing...');
            result.subscribe((response) => {
              console.log('Subscribed to point transaction caching...');
              console.log(response);
              this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                filterBy: e => e.type === 'Add',
                sortBy: 'transactionId',
                sortByOrder: Order.DESC
              });
              console.log('point item transactions');
              console.log(this.pointItemTransactions);
            });

            this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
              filterBy: e => e.type === 'Add',
              sortBy: 'transactionId',
              sortByOrder: Order.DESC
            });
            console.log('point item transactions');
            console.log(this.pointItemTransactions);

            this.pointItemTransactionService.setInitialBatchRetrievedTrue();

          } else {
            console.log(`Cache Point Item Transactions returned ${result}`);
            // We may have retrieved the data but the pointItemTransactions variable may be null... this accounts for that
            if (!this.pointItemTransactions) {
              this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                filterBy: e => e.type === 'Add',
                sortBy: 'transactionId',
                sortByOrder: Order.DESC
              });

              this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
                filterBy: e => e.type === 'Add',
                sortBy: 'transactionId',
                sortByOrder: Order.DESC
              });
            }
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

    // this.feedcardService.addLike(pointTransaction.targetUserId, pointTransaction.transactionId).subscribe(() => {
    //   this.achievementService.incrementAchievement('LikePost').subscribe();
    // });

    this.pointItemTransactionService.addLike(pointTransaction.targetUserId, pointTransaction.transactionId).subscribe(() => {
      this.achievementService.incrementAchievement('LikePost').subscribe();
    });
  }

  onUnlikeClick(pointTransaction: PointItemTransactionModel) {
    const functionName = 'onUnlikeClick';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // this.feedcardService.removeLike(pointTransaction.transactionId).subscribe(() => {
    //   this.achievementService.incrementAchievement('UnlikePost').subscribe();
    // });
    this.pointItemTransactionService.removeLike(pointTransaction.transactionId).subscribe(() => {
      this.achievementService.incrementAchievement('UnlikePost').subscribe();
    });
  }

  loadMore() {
    console.log('loading next batch of posts');
    this.pointItemTransactionService.cacheAddPointItemTransactionsBatch()
      .subscribe((result) => {
        if (result !== false) {
          console.log('Received observable response... subscribing...');
          result.subscribe((response) => {
            console.log('Subscribed to point transaction caching...');
            console.log(response);
            this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
              filterBy: e => e.type === 'Add',
              sortBy: 'transactionId',
              sortByOrder: Order.DESC
            });
            console.log('point item transactions');
            console.log(this.pointItemTransactions);
            console.log(`loaded batch ${this.pointItemTransactionService.numBatchRetrieved}`);
          });

          this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
            filterBy: e => e.type === 'Add',
            sortBy: 'transactionId',
            sortByOrder: Order.DESC
          });

        } else {
          console.log(`Cache Point Item Transactions returned ${result}`);
        }
      });
  }

  function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
    fjs.parentNode.insertBefore(js, fjs);
  }
}
