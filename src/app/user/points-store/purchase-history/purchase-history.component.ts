import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Observable} from 'rxjs';
import {PointItemModel} from '../../../entity-store/point-item/state/point-item.model';
import {PointItemTransactionModel} from '../../../entity-store/point-item-transaction/state/point-item-transaction.model';
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

  public config: PerfectScrollbarConfigInterface = {};
  pointItems$: Observable<PointItemModel[]>;
  user$: Observable<EntityUserModel[]>;
  user: EntityUserModel;
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  isCurrentUserDataRetrieved = false;
  purchaseRequestsRetrieving = false;
  purchaseRequests: UserHasStoreItemModel[];
  purchaseRequests$: Observable<UserHasStoreItemModel[]>;
  pendingPurchaseRequests: UserHasStoreItemModel[];
  approvedPurchaseRequests: UserHasStoreItemModel[];
  declinedPurchaseRequests: UserHasStoreItemModel[];
  fulfilledPurchaseRequests: UserHasStoreItemModel[];
  pendingPurchaseRequests$: Observable<UserHasStoreItemModel[]>;
  approvedPurchaseRequests$: Observable<UserHasStoreItemModel[]>;
  declinedPurchaseRequests$: Observable<UserHasStoreItemModel[]>;
  fulfilledPurchaseRequests$: Observable<UserHasStoreItemModel[]>;
  dataSource$: Observable<UserHasStoreItemModel[]>;
  routerDestination: string[];
  showLimit = 6;

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
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`point-item component starting with the following input user:`);
    console.log(this.inputUser);

    this.spinner.show('purchase-history-spinner');

    this.currentUserService.cacheCurrentUser().subscribe();
    this.userService.cacheUsers().subscribe();
    this.storeItemService.cacheStoreItems().subscribe();
    this.userHasStoreItemService.cacheUserHasStoreItemRecords().subscribe();

    // this.populateCurrentUserData();
    this.currentUser$ = this.currentUserQuery.selectAll();
    this.currentUserQuery.selectAll()
      .subscribe(currentUser => {
        this.currentUser = currentUser[0];
        this.navigationService.setPurchaseRequestDataSourceAll(this.currentUser.userId);
        this.purchaseRequests$ = this.userHasStoreItemQuery.selectAll({
          filterBy: e => e.userId === currentUser[0].userId
        });
      });



    const parentScope = this;
    $('#purchaseHistoryModal').on('hidden.bs.modal',
      function (e) {
        console.log('running on hidden function');
        console.log(e);
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

    console.log(`closing modal and navigating to /user/profile/${user[0].username}`);
    this.routerDestination = ['/', 'user', 'profile', user[0].username];
    this.router.navigate(['/', 'user', 'profile', user[0].username]).then();
    this.navigationService.closePurchaseHistoryModal();
    // this.dialogRef.close();

    $('#pointItemModal').on('hidden.bs.modal',
      function (e) {
        console.log('running on hidden function');
        console.log(e);
        parentScope.navigationService.navigateToProfile(user[0].username);
      });

    // $('#pointsModal').modal('hide');
    this.navigationService.closePointItemModal();
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
    console.log('ngOnDestroy');

  }


}
