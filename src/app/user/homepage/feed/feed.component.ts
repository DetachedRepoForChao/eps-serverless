import { Component, OnInit } from '@angular/core';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {Pointtransaction} from '../../../shared/feedcard/pointtransaction';
import {AvatarService} from '../../../shared/avatar.service';
import {PointTransaction} from '../../../shared/feedcard/feedcard.service';
import {User} from '../../../shared/user.model';
import {LeaderboardUser} from '../../../shared/leaderboard.service';
import {NgxSpinnerService} from 'ngx-spinner';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  componentName = 'feed.component';
  isCardLoading: boolean;
  // pointTransactions: PointTransaction[] = [];

  constructor(public feedcardService: FeedcardService,
              private avatarService: AvatarService,
              private spinner: NgxSpinnerService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    console.log(`${functionFullName}: showing feed-card-spinner`);
    this.spinner.show('feed-card-spinner');

    this.feedcardService.populatePointTransactions().subscribe(() => {
      this.isCardLoading = false;
      console.log(`${functionFullName}: hiding feed-card-spinner`);
      this.spinner.hide('feed-card-spinner');
    });
  }

  // LikeButton(PointTransaction: PointTransaction) {
  //
  // }



}
