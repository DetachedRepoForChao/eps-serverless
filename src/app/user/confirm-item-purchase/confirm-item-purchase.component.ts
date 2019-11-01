import { Component, OnInit } from '@angular/core';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {StoreItemStore} from '../../entity-store/store-item/state/store-item.store';
import {StoreItemQuery} from '../../entity-store/store-item/state/store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {StoreItemModel} from '../../entity-store/store-item/state/store-item.model';
import {MatTableModule } from '@angular/material';

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
  displayedColumns= ['recordId', 'userId', 'storeItemName','storeItemCost','status','acceptRequest','declineRequest'];

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





  }
  test() {

  }

}
