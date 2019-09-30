import { Component, OnInit } from '@angular/core';
import awsconfig from '../../../aws-exports';
import {API, Storage} from 'aws-amplify';
import {AuthService} from '../../login/auth.service';
import {Observable, from} from 'rxjs';
import {StoreItemStore} from '../../entity-store/store-item/state/store-item.store';
import {StoreItemQuery} from '../../entity-store/store-item/state/store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {StoreItemModel} from '../../entity-store/store-item/state/store-item.model';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import { ConfirmationDialogComponent } from '../components/shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog } from '@angular/material';
import { EntityCurrentUserService } from 'src/app/entity-store/current-user/state/entity-current-user.service';
import { CostExplorer } from 'aws-sdk';
import { CurrentUserStore } from 'src/app/entity-store/current-user/state/current-user.store';

@Component({
  selector: 'app-points-store',
  templateUrl: './points-store.component.html',
  styleUrls: ['./points-store.component.css']
})
export class PointsStoreComponent implements OnInit {
  componentName = 'points-store.component';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/things';
  dialogResult = " ";



  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'

    }
  };

  items: StoreItemModel[] = [];
  numRows: number;
  rows = [];
  selectedStoreItem;

  constructor(private storeItemStore: StoreItemStore,
              private storeItemQuery: StoreItemQuery,
              private storeItemService: StoreItemService,
              private entityCurrentUserService: EntityCurrentUserService,
              private currentUserStore: CurrentUserStore,
              public dialog: MatDialog ) {}


  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: "Would you like to redeem this gift?"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog closed: ${result}`);
      this.dialogResult = result;

      if (result === 'Confirm') {
        console.log('Test123');
      } else if (result === 'Cancel') {
        console.log('Test567');
      }
    });
  }

  selectStoreItem(storeItem) {
    this.selectedStoreItem = storeItem;
    
  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.storeItemService.cacheStoreItems().subscribe();
  }

  listStoreItems() {
    // const storeItems = this.storeItemQuery.getAll();
    // const storeItems = this.rows;
    // console.log(storeItems);
    console.log('items:');
    console.log(this.items);
    console.log('numRows:');
    console.log(this.numRows);
    console.log('rows:');
    console.log(this.rows);
    console.log('getAll()');
    console.log(this.storeItemQuery.getAll());
  }

  getStoreItems() {
    this.items = this.storeItemQuery.getAll();
    console.log(this.storeItemQuery.getAll());
    console.log(this.items);
    this.numRows = Math.ceil(this.items.length / 3);
    let index = 0;
    for (let i = 0; i < this.numRows; i++) {
      /*          const row = {
                  items: [this.items[index], this.items[index + 1], this.items[index + 2]]
                };*/

      const row = [];
      row.push(this.items[index]);
      row.push(this.items[index + 1]);
      row.push(this.items[index + 2]);
      console.log('row:');
      console.log(row);
      this.rows.push(row);
      index = index + 3;
    }

    console.log('rows:');
    console.log(this.rows);
  }



/*  getPointItems() {
    Storage.list('store', {
      level: 'public',

    })
      .then((storeItems: any[]) => {
        console.log(storeItems);
        const storeItemsFiltered = storeItems.filter(x => x.key !== 'store/');
        const promises: Promise<any>[] = [];
        for (let i = 0; i < storeItemsFiltered.length; i++) {
          console.log(storeItemsFiltered[i]);
          promises.push(Storage.get(storeItemsFiltered[i].key, {level: 'public'}));
        }

        Promise.all(promises)
          .then(promResults => {
            for (let i = 0; i < promResults.length; i++) {
              console.log(`promise result: ${promResults[i]}`);
              this.items.push(promResults[i]);
            }

            this.numRows = Math.ceil(this.items.length / 3);
            let index = 0;
            for (let i = 0; i < this.numRows; i++) {
              const row = {
                items: [this.items[index], this.items[index + 1], this.items[index + 2]]
              };
              console.log(row);
              this.rows.push(row);
              index = index + 3;
            }

            console.log(this.rows);
          });
      });
  }*/


}
