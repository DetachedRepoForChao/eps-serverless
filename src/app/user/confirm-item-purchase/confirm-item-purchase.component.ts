import {Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {StoreItemStore} from '../../entity-store/store-item/state/store-item.store';
import {StoreItemQuery} from '../../entity-store/store-item/state/store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {StoreItemModel} from '../../entity-store/store-item/state/store-item.model';
import {MatSort, MatTableModule, MatTableDataSource, MatDialog, MatTable} from '@angular/material';
import { ConfirmationDialogComponent } from '../components/shared/confirmation-dialog/confirmation-dialog.component';
import {Router } from '@angular/router';
import {NavigationService} from '../../shared/navigation.service';


import {from, Observable} from 'rxjs';
import {UserHasStoreItemQuery} from '../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {UserHasStoreItemModel} from '../../entity-store/user-has-store-item/state/user-has-store-item.model';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';

declare var $: any;

@Component({
  selector: 'app-confirm-item-purchase',
  templateUrl: './confirm-item-purchase.component.html',
  styleUrls: ['./confirm-item-purchase.component.css']
})
export class ConfirmItemPurchaseComponent implements OnInit {
  @ViewChild('requestTable') requestTable: MatTable<UserHasStoreItemModel>;
  componentName = 'confirm-item-purchase.component';


  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser;
  items: StoreItemModel[] = [];
  numRows: number;
  rows = [];
  requestedStoreItem: UserHasStoreItemModel;
  dialogResult = " ";
  managerRequests$: Observable<UserHasStoreItemModel[]>;
  displayedColumns = ['createdAt', 'userUsername', 'storeItemName', 'status', 'action'];

  approveOptions = [
    {name: 'Approve', checked: false},
    {name: 'Decline', checked: false},
    {name: 'Pending', checked: true}
  ];

  approveList = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor ( private currentUserStore: CurrentUserStore,
                private entityUserService: EntityUserService,
                private entityUserQuery: EntityUserQuery,
                private userHasStoreItemService: UserHasStoreItemService,
                private storeItemStore: StoreItemStore,
                private storeItemQuery: StoreItemQuery,
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

    this.currentUser$ = this.currentUserQuery.selectAll();
    this.entityUserService.cacheUsers().subscribe();
    this.storeItemService.cacheStoreItems().subscribe();
    this.userHasStoreItemService.cacheUserHasStoreItemManagerRecords().subscribe((result) => {
      console.log(result);
    });

    this.managerRequests$ = this.userHasStoreItemQuery.selectAll();

      // this.dataSource.sort = this.sort;
  }


  approvalToggle(row, event){
    console.log(this.requestTable);
    console.log('row:');
    console.log(row);
    console.log('event:');
    console.log(event);
    const approveItem = {
      item: row,
      approveAction: event.value
    };

    if (this.approveList.find(x => x.item === row)) {
      console.log(`Record ID ${row.recordId} already exists in the approveList`);
      console.log(this.approveList.find(x => x.item === row));
      this.approveList.find(x => x.item === row).approveAction = event.value;
    } else {
      this.approveList.push(approveItem);
    }

    console.log(this.approveList);


  }

  cancelApproval(): void {
    console.log('cancelled');
    this.router.navigate(['/store']);

  }

  test() {

  }

  approveRequest(request) {
    console.log(request);
    this.userHasStoreItemService.approveStoreItemRequest(request).subscribe();

  }

  openDialog(): void {
    console.log(`confirm approval?`);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: "Would you like to save your changes?"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog closed: ${result}`);
      this.dialogResult = result;
      if (result === 'Confirm') {
        const onSave = this.onSaveClick();
        }
       else if (result === 'Cancel') {
        console.log('Cancelled');
      }
    });
    }

  onSaveClick() {
    console.log(this.approveList);
    const approvedItems = this.approveList.filter(x => x.approveAction === 'Approve');
    const declinedItems = this.approveList.filter(x => x.approveAction === 'Decline');
    console.log('Approved Items:');
    console.log(approvedItems);
    console.log('Declined Items:');
    console.log(declinedItems);

    // Do something with the approved items


    // Do something the declined items

  }
}
