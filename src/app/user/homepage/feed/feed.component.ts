import { Component, OnInit } from '@angular/core';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {Pointtransaction} from '../../../shared/feedcard/pointtransaction';



@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  PointTransactions;
  constructor(public feedcardService: FeedcardService ) { }

  ngOnInit() {
    this.feedcardService.getPointTransaction()
      .then(point_transactions => {
        // this.PointTransactions = point_transactions['PointTransactionResult'];
        // console.log('PointTransactionResult:' + point_transactions['PointTransactionResult']);
        this.PointTransactions = point_transactions['pointTransactions'];
        console.log('PointTransactionResult:' + point_transactions['pointTransactions']);
      });
  }

  // LikeButton(PointTransaction: Pointtransaction) {
  //
  // }



}
