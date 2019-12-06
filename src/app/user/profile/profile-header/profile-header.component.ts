import { Component, OnInit } from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';

declare var $: any;

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css']
})
export class ProfileHeaderComponent implements OnInit {

  leaderboardUsers$: Observable<EntityUserModel[]>;
  currentUser$: Observable<EntityCurrentUserModel[]>;

  constructor(private currentUserService: EntityCurrentUserService,
              private userService: EntityUserService,
              private achievementService: AchievementService,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService,
              public userQuery: EntityUserQuery,
              public currentUserQuery: EntityCurrentUserQuery,
              public achievementQuery: AchievementQuery) { }

  ngOnInit() {
    const observables: Observable<any>[] = [];
    observables.push(
      this.currentUserService.cacheCurrentUser(),
      this.userService.cacheUsers(),
      this.achievementService.cacheAchievements(),
      this.storeItemService.cacheStoreItems(),
      this.userHasStoreItemService.cacheUserHasStoreItemRecords()
    );

    forkJoin(observables)
      .subscribe(() => {

      });

    this.leaderboardUsers$ = this.userQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.currentUser$ = this.currentUserQuery.selectAll({
      limitTo: 1
    });

    this.userHasStoreItemService.getPendingBalance().subscribe(balance => {
      console.log('balance: ' + balance);
      this.currentUserService.updatePointsBalance(balance);
    });
  }

  getPendingBalance(): Observable<any> {
    return new Observable(observer => {
      this.currentUserQuery.selectAll()
        .subscribe(user => {
          if (user[0]) {
            observer.next(user[0].pointsBalance);
            observer.complete();
          } else {
            observer.complete();
          }

        });
    });
  }

  avatarClick() {
    $('#avatarModal').modal('show');
  }

  getFirstDigit(number: number) {
    const one = String(number).charAt(0);
    return Number(one);
  }
}
