import {Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {StoreItemStore} from '../../entity-store/store-item/state/store-item.store';
import {StoreItemQuery} from '../../entity-store/store-item/state/store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {StoreItemModel} from '../../entity-store/store-item/state/store-item.model';
import {MatSort, MatTableModule, MatTableDataSource} from '@angular/material';

import { from } from 'rxjs';
import {UserHasStoreItemQuery} from '../../entity-store/user-has-store-item/state/user-has-store-item.query';

declare var $: any;

@Component({
  selector: 'app-confirm-item-purchase',
  templateUrl: './confirm-item-purchase.component.html',
  styleUrls: ['./confirm-item-purchase.component.css']
})
export class ConfirmItemPurchaseComponent implements OnInit {
  componentName = 'confirm-item-purchase.component';


  currentUser$;
  currentUser;
  items: StoreItemModel[] = [];
  numRows: number;
  rows = [];
  requestedStoreItem;
  managerRequests$;
  displayedColumns= ['recordId', 'userUsername', 'storeItemName','storeItemCost','status','acceptRequest'];
  approveOptions = [
    {name: 'Approve', checked: false},
    {name: 'Decline', checked: false},
    {name: 'Pending', checked: true}
  ];

  approveList = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor ( private currentUserStore: CurrentUserStore,
                private entityUserService: EntityUserService,
                private userHasStoreItemService: UserHasStoreItemService,
                private storeItemStore: StoreItemStore,
                private storeItemQuery: StoreItemQuery,
                private storeItemService: StoreItemService,
                public currentUserQuery: EntityCurrentUserQuery,
                private userHasStoreItemQuery: UserHasStoreItemQuery) { }



  requestStoreItem(storeItem) {
    this.requestedStoreItem = storeItem;
    console.log(this.requestedStoreItem);
  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);


    this.currentUser$ = this.currentUserQuery.selectAll();
    this.entityUserService.cacheUsers().subscribe();

    this.userHasStoreItemService.cacheUserHasStoreItemManagerRecords().subscribe(() => {
    });

    this.managerRequests$ = this.userHasStoreItemQuery.selectAll();

      this.dataSource.sort = this.sort;
  }


  approvalToggle(row, event){
    console.log('row:');
    console.log(row);
    console.log('event:');
    console.log(event);
    const approveItem = {
      item: row,
      approveAction: event.value.name
    };

    if (this.approveList.find(x => x.item === row)) {
      console.log(`Record ID ${row.recordId} already exists in the approveList`);
      console.log(this.approveList.find(x => x.item === row));
      this.approveList.find(x => x.item === row).approveAction = event.value.name;
    } else {
      this.approveList.push(approveItem);
    }

    console.log(this.approveList);


  }

  declineToggle(event) {
    console.log(event);
  }

  test() {

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
