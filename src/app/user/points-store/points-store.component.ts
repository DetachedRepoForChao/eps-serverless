import { Component, OnInit } from '@angular/core';
import awsconfig from '../../../aws-exports';
import {API, Storage} from 'aws-amplify';
import {AuthService} from '../../login/auth.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-points-store',
  templateUrl: './points-store.component.html',
  styleUrls: ['./points-store.component.css']
})
export class PointsStoreComponent implements OnInit {
  componentName = 'points-store.component';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/things';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  items = [];
  numRows: number;
  rows = [];

  constructor() { }

  ngOnInit() {
    this.getStoreItems();
  }

  getStoreItems() {
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

  }
}
