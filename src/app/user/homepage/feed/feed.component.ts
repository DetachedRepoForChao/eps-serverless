import { Component, OnInit } from '@angular/core';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {Pointtransaction} from '../../../shared/feedcard/pointtransaction';



@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  componentName = 'feed.component';
  PointTransactions;
  constructor(public feedcardService: FeedcardService ) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.feedcardService.getPointTransaction()
      .then(point_transactions => {
        // this.PointTransactions = point_transactions['PointTransactionResult'];
        // console.log('PointTransactionResult:' + point_transactions['PointTransactionResult']);
        this.PointTransactions = point_transactions;
        console.log(`${functionFullName}: PointTransactionResult:`);
        console.log(point_transactions);
      });
  }

  // LikeButton(PointTransaction: PointTransaction) {
  //
  // }



}
