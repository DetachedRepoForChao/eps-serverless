import { Component, OnInit } from '@angular/core';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {Pointtransaction} from '../../../shared/feedcard/pointtransaction';
import {AvatarService} from '../../../shared/avatar.service';
import {PointTransaction} from '../../../shared/feedcard/feedcard.service';
import {User} from '../../../shared/user.model';
import {LeaderboardUser} from '../../../shared/leaderboard.service';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  componentName = 'feed.component';
  // pointTransactions: PointTransaction[] = [];

  constructor(public feedcardService: FeedcardService,
              private avatarService: AvatarService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.feedcardService.populatePointTransactions().subscribe();
  }

  // LikeButton(PointTransaction: PointTransaction) {
  //
  // }



}
