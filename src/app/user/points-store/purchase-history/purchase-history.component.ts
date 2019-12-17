import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Observable, Subject} from 'rxjs';
import {PointItemModel} from '../../../entity-store/point-item/state/point-item.model';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {NavigationService} from '../../../shared/navigation.service';
import {Order} from '@datorama/akita';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {UserHasStoreItemQuery} from '../../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {StoreItemQuery} from '../../../entity-store/store-item/state/store-item.query';
import {UserHasStoreItemModel} from '../../../entity-store/user-has-store-item/state/user-has-store-item.model';
import {take, takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.css']
})
export class PurchaseHistoryComponent implements OnInit, OnDestroy {
  @Input() inputUser: EntityCurrentUserModel;
  @Output() clearInputUser = new EventEmitter<any>();

  componentName = 'purchase-history.component';

  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private userLoading$ = new Subject();
  private requestsLoading$ = new Subject();

  public config: PerfectScrollbarConfigInterface = {};
  user: EntityUserModel;
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  purchaseRequests: UserHasStoreItemModel[];
  dataSource: UserHasStoreItemModel[];
  routerDestination: string[];
  showLimit = 6;
  currentPurchaseRequestTabItem = 'allActive';
  purchaseRequestTabItems = [
    'allActive',
    'pending',
    'readyForPickup',
    'pickedUp',
    'archived',
  ];

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
              private currentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionService: PointItemTransactionService,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private userHasStoreItemService: UserHasStoreItemService,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private storeItemService: StoreItemService,
              private storeItemQuery: StoreItemQuery,
              private navigationService: NavigationService) { }

  ngOnInit() {
    // const functionName = 'ngOnInit';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(`point-item component starting with the following input user:`);
    // console.log(this.inputUser);

    this.spinner.show('purchase-history-spinner');

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
              this.navigationService.setPurchaseRequestDataSourceAllActive(this.currentUser.userId);

              this.userHasStoreItemQuery.selectLoading()
                .pipe(takeUntil(this.requestsLoading$))
                .subscribe(isRequestsLoading => {
                  if (!isRequestsLoading) {
                    this.userHasStoreItemQuery.selectAll({
                      filterBy: e => e.userId === currentUser.userId
                    })
                      .pipe(takeUntil(this.unsubscribe$))
                      .subscribe((requests: UserHasStoreItemModel[]) => {
                        this.purchaseRequests = requests;
                      });

                    this.requestsLoading$.next();
                    this.requestsLoading$.complete();
                  }
                });
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });

    this.setPurchaseRequestDataSource(this.currentPurchaseRequestTabItem);

    const parentScope = this;
    $('#purchaseHistoryModal').on('hidden.bs.modal',
      function (e) {
        // console.log('running on hidden function');
        // console.log(e);
        parentScope.navigationService.closePurchaseHistoryModal();
        parentScope.navigationService.purchaseHistoryModalActive = false;
      });
  }

  // groupBy function reference: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
  // I'm not sure why or how this works...
  groupBy (xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  onUserClick(userId: number) {
    const parentScope = this;
    const user = this.userQuery.getAll({
      filterBy: e => e.userId === userId
    });

    // console.log(`closing modal and navigating to /user/profile/${user[0].username}`);
    this.routerDestination = ['/', 'user', 'profile', user[0].username];
    this.router.navigate(['/', 'user', 'profile', user[0].username]).then();
    this.navigationService.closePurchaseHistoryModal();
    // this.dialogRef.close();

    $('#pointItemModal').on('hidden.bs.modal',
      function (e) {
        // console.log('running on hidden function');
        // console.log(e);
        parentScope.navigationService.navigateToProfile(user[0].username);
      });

    // $('#pointsModal').modal('hide');
    this.navigationService.closePointItemModal();
  }

  onPickedUpClick(request: UserHasStoreItemModel) {
    // console.log('item has been marked as picked up');
    this.userHasStoreItemService.setStoreItemRequestPickedUp(request)
      .pipe(take(1))
      .subscribe();

  }

  onPurchaseRequestTabItemClick(clickedItem: string) {
    if (this.currentPurchaseRequestTabItem === clickedItem) {
      // Already there, do nothing.
    } else {
      for (const item of this.purchaseRequestTabItems) {
        if (item === clickedItem) {
          this.currentPurchaseRequestTabItem = clickedItem;
          document.getElementById(`purchaseRequestTab_${item}`).className = document.getElementById(`purchaseRequestTab_${item}`).className += ' toggled';
        } else {
          document.getElementById(`purchaseRequestTab_${item}`).className = document.getElementById(`purchaseRequestTab_${item}`).className.replace('toggled', '').trim();
        }
      }
    }
  }

  setPurchaseRequestDataSource(filter) {
    const currentDate = Date.now();
    let otherDate;
    let dayDiff;

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
          if (!isLoading) {
            this.currentUserQuery.selectCurrentUser()
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((currentUser: EntityCurrentUserModel) => {
                this.userHasStoreItemQuery.selectLoading()
                  .pipe(takeUntil(this.requestsLoading$))
                  .subscribe(isRequestsLoading => {
                    if (!isRequestsLoading) {
                      this.userHasStoreItemQuery.selectAll({
                        filterBy: e => {
                          if (e.userId === currentUser.userId) {
                            switch (filter) {
                              case 'allActive':
                                if (e.status === 'pickedUp') {
                                  otherDate = new Date(e.pickedUpAt);
                                  dayDiff = (currentDate - otherDate.getTime()) / (1000 * 60 * 60 * 24);
                                  if (dayDiff >= 5) {
                                    return false;
                                  }
                                }
                                return true;
                              case 'pending':
                                if (e.status === 'pending') {
                                  return true;
                                }
                                return false;
                              case 'readyForPickup':
                                if (e.status === 'readyForPickup') {
                                  return true;
                                }
                                return false;
                              case 'pickedUp':
                                if (e.status === 'pickedUp') {
                                  return true;
                                }
                                return false;
                              case 'archived':
                                if (e.status === 'pickedUp') {
                                  otherDate = new Date(e.pickedUpAt);
                                  dayDiff = (currentDate - otherDate.getTime()) / (1000 * 60 * 60 * 24);
                                  if (dayDiff >= 5) {
                                    return true;
                                  }
                                }
                                return false;
                            }
                          }

                        },
                        sortBy: 'createdAt',
                        sortByOrder: Order.DESC
                      })
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe((requests: UserHasStoreItemModel[]) => {
                          this.dataSource = requests;
                        });

                      this.requestsLoading$.next();
                      this.requestsLoading$.complete();
                    }
                  });
              });

            this.currentUserLoading$.next();
            this.currentUserLoading$.complete();
          }
        });
  }

  setPurchaseRequestDataSourceAllActive(currentUser) {

}

/*

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);

    if (changes) {
      console.log('clearing all variables');
      this.pointItems$ = null;
      this.pointItemTransactions$ = null;
      this.user$ = null;
      this.user = null;
      this.currentUser$ = null;
      this.currentUser = null;
      this.managerUser$ = null;
      this.managerUser = null;
      this.currentManager$ = null;
      this.currentManager = null;
      this.pointItemsTransactionsRetrieving = false;
      this.pointItemTransactions = null;
      this.isUserDataRetrieved = false;
      this.isCurrentUserDataRetrieved = false;
      this.isCurrentManagerDataRetrieved = false;
      this.isManagerDataRetrieved = false;
      this.isManager = false;
      this.showLimit = 6;

      console.log('on changes input user:');
      console.log(this.inputUser);

      console.log('on changes populating data');

      this.populateCurrentUserData();

      const parentScope = this;
      $('#pointItemModal').on('hidden.bs.modal',
        function (e) {
          console.log('running on hidden function');
          console.log(e);
          parentScope.navigationService.closePurchaseHistoryModal();
        });
    }
  }
*/

  ngOnDestroy(): void {
    // console.log('ngOnDestroy');
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.userLoading$.next();
    this.userLoading$.complete();
    this.requestsLoading$.next();
    this.requestsLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
