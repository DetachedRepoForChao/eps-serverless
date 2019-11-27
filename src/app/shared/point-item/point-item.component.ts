import {Component, Input, OnInit} from '@angular/core';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Globals} from '../../globals';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {Router} from '@angular/router';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import {FeatureService} from '../../entity-store/feature/state/feature.service';
import {FeatureQuery} from '../../entity-store/feature/state/feature.query';
import {AchievementModel} from '../../entity-store/achievement/state/achievement.model';
import {PointItemService} from '../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../entity-store/point-item/state/point-item.query';
import {PointItemTransactionService} from '../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {Observable} from 'rxjs';
import {Order} from '@datorama/akita';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {Spinner} from 'ngx-spinner/lib/ngx-spinner.enum';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-point-item',
  templateUrl: './point-item.component.html',
  styleUrls: ['./point-item.component.css']
})
export class PointItemComponent implements OnInit {
  @Input() inputUser;

  componentName = 'point-item.component';

  public config: PerfectScrollbarConfigInterface = {};
  pointItems$;
  pointItemTransactions$;
  user$;
  user;
  currentUser$;
  currentUser;
  pointItemsTransactionsRetrieving = false;
  pointItemTransactions;
  isUserDataRetrieved;
  isCurrentUserDataRetrieved;

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
              private currentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionService: PointItemTransactionService,
              private pointItemTransactionQuery: PointItemTransactionQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.spinner.show('other-user-spinner');
    this.currentUserService.cacheCurrentUser().subscribe();
    this.userService.cacheUsers().subscribe();
    this.pointItemService.cachePointItems().subscribe();
    this.pointItems$ = this.pointItemQuery.selectAll();

    if (this.inputUser) {
      this.userQuery.selectLoading()
        .subscribe(userQueryLoading => {
          console.log(`User loading status is ${userQueryLoading}`);
          if (!userQueryLoading) {
            this.user$ = this.userQuery.selectAll({
              filterBy: e => e.username === this.inputUser.username
            });

            this.user$.subscribe(user => {
              if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
                this.pointItemsTransactionsRetrieving = true;
                this.pointItemTransactionService.cacheUserPointItemTransactions(user[0].userId)
                  .subscribe((result: Observable<any> | any) => {
                    if (result !== false) {
                      result.subscribe(() => {
                        this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                          filterBy: e => e.targetUserId === user[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });

                        this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
                          filterBy: e => e.targetUserId === user[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });
                        console.log('point item transactions');
                        console.log(this.pointItemTransactions);
                      });

                    } else {
                      console.log(`Cache User Point Item Transactions returned ${result}`);
                      // We may have retrieved the data but the pointItemTransactions variable may be null... this accounts for that
                      if (!this.pointItemTransactions) {
                        this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                          filterBy: e => e.targetUserId === user[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });

                        this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
                          filterBy: e => e.targetUserId === user[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });

                      }
                    }
                  });
              } else {
                console.log(`Already retrieving point item transactions`);
              }

              // Pull user info into a static variable if this hasn't happened yet
              if (!this.user) {
                this.user = this.userQuery.getAll({
                  filterBy: e => e.username === this.inputUser.username
                })[0];
              }

              this.isUserDataRetrieved = true;
              this.spinner.hide('point-item-spinner');
            });
          } else {
            console.log('ERROR: User is still loading');
          }
        });
    } else {
      this.currentUserQuery.selectLoading()
        .subscribe(currentUserQueryLoading => {
          console.log(`Current User loading status is ${currentUserQueryLoading}`);
          if (!currentUserQueryLoading) {
            this.currentUser$ = this.currentUserQuery.selectAll();

            this.currentUser$.subscribe(currentUser => {
              if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
                this.pointItemsTransactionsRetrieving = true;
                this.pointItemTransactionService.cacheUserPointItemTransactions(currentUser[0].userId)
                  .subscribe((result: Observable<any> | any) => {
                    if (result !== false) {
                      result.subscribe(() => {
                        this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                          filterBy: e => e.targetUserId === currentUser[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });

                        this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
                          filterBy: e => e.targetUserId === currentUser[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });

                        console.log('point item transactions');
                        console.log(this.pointItemTransactions);
                      });

                    } else {
                      console.log(`Cache User Point Item Transactions returned ${result}`);
                      // We may have retrieved the data but the pointItemTransactions variable may be null... this accounts for that
                      if (!this.pointItemTransactions) {
                        this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                          filterBy: e => e.targetUserId === currentUser[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });

                        this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll({
                          filterBy: e => e.targetUserId === currentUser[0].userId,
                          sortBy: 'createdAt',
                          sortByOrder: Order.DESC
                        });
                      }
                    }
                  });
              } else {
                console.log(`Already retrieving point item transactions`);
              }

              // Pull user info into a static variable if this hasn't happened yet
              if (!this.currentUser) {
                this.currentUser = this.currentUserQuery.getAll()[0];
              }

              this.isCurrentUserDataRetrieved = true;
              this.spinner.hide('point-item-spinner');
            });
          } else {
            console.log('ERROR: User is still loading');
          }
        });
    }


  }

  // groupBy function reference: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
  // I'm not sure why or how this works...
  groupBy (xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }


}
