import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {StoreItemStore} from '../../entity-store/store-item/state/store-item.store';
import {StoreItemQuery} from '../../entity-store/store-item/state/store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {StoreItemModel} from '../../entity-store/store-item/state/store-item.model';
import {MatCheckboxChange, MatDialog, MatSort, MatTable} from '@angular/material';
import {ConfirmationDialogComponent} from '../components/shared/confirmation-dialog/confirmation-dialog.component';
import {Router} from '@angular/router';
import {NavigationService} from '../../shared/navigation.service';


import {Observable, Subject, Subscription} from 'rxjs';
import {UserHasStoreItemQuery} from '../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {UserHasStoreItemModel} from '../../entity-store/user-has-store-item/state/user-has-store-item.model';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {take, takeUntil} from 'rxjs/operators';
import {EntityUserModel} from '../../entity-store/user/state/entity-user.model';
import {Order} from '@datorama/akita';

declare var $: any;

@Component({
  selector: 'app-confirm-item-purchase',
  templateUrl: './confirm-item-purchase.component.html',
  styleUrls: ['./confirm-item-purchase.component.css']
})
export class ConfirmItemPurchaseComponent implements OnInit, OnDestroy {
  @ViewChild('requestTable') requestTable: MatTable<UserHasStoreItemModel>;
  componentName = 'confirm-item-purchase.component';

  private subscription = new Subscription();
  private requestsLoading$ = new Subject();
  private usersLoading$ = new Subject();
  private unsubscribe$ = new Subject();


  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  users: EntityUserModel[];
  items: StoreItemModel[] = [];
  numRows: number;
  rows = [];
  requestedStoreItem: UserHasStoreItemModel;
  dialogResult = " ";
  managerRequests$: Observable<UserHasStoreItemModel[]>;
  managerRequests: UserHasStoreItemModel[];
  displayedColumns = ['createdAt', 'userUsername', 'storeItemName', 'status', 'action'];

  actionList = [];
  currentTabItem = 'allActive';
  tabItems = [
    'allActive',
    'readyForPickup',
    'pickedUp',
    'cancelled',
    'archived'
  ];


  @ViewChild(MatSort) sort: MatSort;

  constructor ( private currentUserStore: CurrentUserStore,
                private entityUserService: EntityUserService,
                private userQuery: EntityUserQuery,
                private userHasStoreItemService: UserHasStoreItemService,
                private storeItemStore: StoreItemStore,
                public storeItemQuery: StoreItemQuery,
                private storeItemService: StoreItemService,
                public dialog: MatDialog,
                public currentUserQuery: EntityCurrentUserQuery,
                private router: Router,
                private navigationService: NavigationService,
                private userHasStoreItemQuery: UserHasStoreItemQuery) { }



  requestStoreItem(storeItem) {
    this.requestedStoreItem = storeItem;
    console.log(this.requestedStoreItem);
  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(this.requestTable);

    // this.currentUser$ = this.currentUserQuery.selectAll();
/*    this.entityUserService.cacheUsers().subscribe();
    this.storeItemService.cacheStoreItems().subscribe();
    this.userHasStoreItemService.cacheUserHasStoreItemRecords().subscribe((result) => {
      console.log(result);
    });*/

    // this.subscription;

    this.userHasStoreItemQuery.selectLoading()
      .pipe(takeUntil(this.requestsLoading$))
      .subscribe(isLoading => {
        console.log('isLoading?: ' + isLoading);
        if (!isLoading) {
          this.filterDataSourceByStatus(this.currentTabItem);
          // this.managerRequests$ = this.userHasStoreItemQuery.selectAll();
        }
      });

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.users = users;
            });
          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });
  }


  actionToggle(row, event: MatCheckboxChange) {
    console.log(this.requestTable);
    console.log('row:');
    console.log(row);
    console.log('event:');
    console.log(event);

    const eventItem: MatCheckboxChange = event;
    const actionItem = {
      item: row,
      action: event.source.value,
      event: eventItem,
    };

/*    if (event.source && event.source.value === 'Fulfill' && event.checked === true) {
      actionItem.action = 'Fulfill';
    } else if (event.source && event.source.value === 'Fulfill' && event.checked === false) {
      if (this.actionList.find(x => x.item === row)) {
        console.log(`Record ID ${row.recordId} already exists in the action list. We're going to remove it from the list.`);
        this.actionList = this.actionList.filter(x => x.item !== row);
      }
      return;
    } else {
      actionItem.action = event.value;
    }*/

    if (this.actionList.find(x => x.item === row) && event.checked === false) {
      console.log(`Record ID ${row.recordId} already exists in the action list. Removing.`);
      // console.log(this.actionList.find(x => x.item === row));
      this.actionList = this.actionList.filter(x => x.item !== row);
    } else {
      this.actionList.push(actionItem);
    }

    console.log(this.actionList);
  }

  cancelApproval(): void {
    console.log('cancelled');
    console.log(this.actionList);
    for (const action of this.actionList) {
      action.event.source.toggle();
    }
    this.router.navigate(['/', 'user', 'store']);

  }

  untoggleAll() {
    for (const actionItem of this.actionList) {
      actionItem.event.source.toggle();
    }
  }

  openDialog(): void {
    console.log(`confirm approval?`);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {action: 'updatePurchaseRequestStatusSave', actionList: this.actionList}
    });

    // width: '600px',
    // data: "Would you like to save your changes?",

    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe(result => {
      console.log(`Dialog closed: ${result}`);
      this.dialogResult = result;
      if (result === 'Confirm') {
        const onSave = this.onSaveClick();
      } else if (result === 'Cancel') {
        console.log('Cancelled');
      }
    });
  }

  onSaveClick() {
    console.log(this.actionList);

    const actionList = [];
    this.actionList.forEach((actionItem) => {
      actionList.push(actionItem);
    });

    this.userHasStoreItemService.processRequests(actionList)
      .pipe(take(1))
      .subscribe(results => {
        console.log('processRequests results', results);

        // Find the response the corresponds with items that were changed to ReadyForPickup
        for (const result of results) {
          console.log(result);

          if (result.newStatus === 'readyForPickup' && result.status !== false) {
            const purchaseRequestManager = result.updatedByUser;

            const purchaseRequestManagerObject = {
              userId: purchaseRequestManager.userId,
              username: purchaseRequestManager.username,
              firstName: purchaseRequestManager.firstName,
              lastName: purchaseRequestManager.lastName,
              email: purchaseRequestManager.email,
              phone: purchaseRequestManager.phone,
              emailNotifications: purchaseRequestManager.emailNotifications,
              phoneNotifications: purchaseRequestManager.phoneNotifications,
            };

            const readyForPickupRequests = result.updatedRecords;

            const groups = readyForPickupRequests.reduce(function (obj, item) {
              obj[item.userId] = obj[item.userId] || [];
              obj[item.userId].push(item);
              return obj;
            }, {});

            const groupedArray = Object.keys(groups).map(function(key) {
              return {userId: key, requests: groups[key]};
            });

            console.log(groupedArray);

            for (const userRequests of groupedArray) {

              const requestUser = this.users.find(x => x.userId === +userRequests.userId);
              const requestUserObject = {
                userId: requestUser.userId,
                username: requestUser.username,
                email: requestUser.email,
                phone: requestUser.phone,
                emailNotifications: requestUser.emailNotifications,
                phoneNotifications: requestUser.phoneNotifications,
                firstName: requestUser.firstName,
                lastName: requestUser.lastName,
              };

              const storeItems = [];

              for (const request of userRequests.requests) {
                const storeItem = {
                  storeItemName: request.storeItemName,
                  storeItemCost: request.storeItemCost,
                  storeItemId: request.storeItemId,
                  storeItemDescription: request.storeItemDescription,
                };

                storeItems.push(storeItem);
              }

              this.userHasStoreItemService.sendReadyForPickupNotice(purchaseRequestManagerObject, requestUserObject, storeItems)
                .pipe(take(1))
                .subscribe(sendNoticeResult => {
                  console.log(`Results from sending notices to ${requestUser.username}`, sendNoticeResult);
                });
            }
          }

        }
      });

    this.untoggleAll();
  }


  onUserClick(userId: number) {
    const user = this.userQuery.getAll({
      filterBy: e => e.userId === userId
    });

    console.log(`navigating to /user/profile/${user[0].username}`);
    this.router.navigate(['/', 'user', 'profile', user[0].username]).then();
  }


  onTabItemClick(clickedItem: string) {
    if (this.currentTabItem === clickedItem) {
      // Already there, do nothing.
    } else {
      for (const item of this.tabItems) {
        if (item === clickedItem) {
          this.currentTabItem = clickedItem;
          document.getElementById(`confirmItemPurchaseTab_${item}`).className = document.getElementById(`confirmItemPurchaseTab_${item}`).className += ' toggled';
        } else {
          document.getElementById(`confirmItemPurchaseTab_${item}`).className = document.getElementById(`confirmItemPurchaseTab_${item}`).className.replace('toggled', '').trim();
        }
      }
    }
  }

  filterDataSourceByStatus(status: string) {
    console.log('filterDataSourceByStatus');
    const currentDate = Date.now();
    let otherDate;
    let dayDiff;

    if (status === 'allActive') {

      this.userHasStoreItemQuery.selectAll({
        filterBy: e => {
          if (e.status === 'pickedUp') {
            otherDate = new Date(e.pickedUpAt);
            dayDiff = (currentDate - otherDate.getTime()) / (1000 * 60 * 60 * 24);
            if (dayDiff >= 5) {
              return false;
            }
          }
          return true;
        },
        sortBy: 'createdAt',
        sortByOrder: Order.DESC,
      })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((requests: UserHasStoreItemModel[]) => {
          this.managerRequests = requests;
          console.log(requests);
        });

      return;
    } else if (status === 'archived') {


        this.userHasStoreItemQuery.selectAll({
          filterBy: e => {
            if (e.status === 'pickedUp') {
              otherDate = new Date(e.pickedUpAt);
              dayDiff = (currentDate - otherDate.getTime()) / (1000 * 60 * 60 * 24);
              if (dayDiff >= 5) {
                return true;
              }
            }
            return false;
          },
          sortBy: 'createdAt',
          sortByOrder: Order.DESC,
        })
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((requests: UserHasStoreItemModel[]) => {
            this.managerRequests = requests;
            console.log(requests);
          });
      return;
    }

    this.userHasStoreItemQuery.selectAll({
      filterBy: e => e.status === status,
      sortBy: 'createdAt',
      sortByOrder: Order.DESC,
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((requests: UserHasStoreItemModel[]) => {
        this.managerRequests = requests;
        console.log(requests);
      });

  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    this.requestsLoading$.next();
    this.requestsLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
