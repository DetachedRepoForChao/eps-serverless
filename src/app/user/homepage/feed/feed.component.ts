import { Component, OnInit } from '@angular/core';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {Pointtransaction} from '../../../shared/feedcard/pointtransaction';
import {PointTransaction} from '../../../shared/feedcard/feedcard.service';
import {User} from '../../../shared/user.model';
import {LeaderboardUser} from '../../../shared/leaderboard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Globals} from '../../../globals';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {UserStore} from '../../../entity-store/user/state/user.store';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';


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
              private spinner: NgxSpinnerService,
              private globals: Globals,
              private entityUserService: EntityUserService,
              private userStore: UserStore,
              private entityUserQuery: EntityUserQuery,
              private achievementService: AchievementService) { }

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

  onLikeClick(pointTransaction: PointTransaction) {
    const functionName = 'onLikeClick';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.feedcardService.addLike(pointTransaction.targetUserId, pointTransaction.id).subscribe(() => {
      this.achievementService.incrementAchievement('LikePost').subscribe();
    });
  }

  onUnlikeClick(pointTransaction: PointTransaction) {
    const functionName = 'onUnlikeClick';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.feedcardService.removeLike(pointTransaction.id).subscribe(() => {
      this.achievementService.incrementAchievement('UnlikePost').subscribe();
    });
  }

  function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
    fjs.parentNode.insertBefore(js, fjs);
  }
}
