import { Component, OnInit } from '@angular/core';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {forkJoin, Observable} from 'rxjs';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {NavigationService} from '../../../shared/navigation.service';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';

declare var $: any;

@Component({
  selector: 'app-points-store-header',
  templateUrl: './points-store-header.component.html',
  styleUrls: ['./points-store-header.component.css']
})
export class PointsStoreHeaderComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {};
  currentUser$: Observable<EntityCurrentUserModel[]>;

  constructor(private currentUserService: EntityCurrentUserService,
              private userService: EntityUserService,
              private achievementService: AchievementService,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService,
              private userQuery: EntityUserQuery,
              private currentUserQuery: EntityCurrentUserQuery,
              private achievementQuery: AchievementQuery,
              private navigationService: NavigationService) { }

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

  viewPurchaseHistory() {
    console.log('view purchase history');
  }

  showPurchaseHistoryModal() {
    console.log(`invoking points modal with the following user input:`);
    const currentUser = this.currentUserQuery.getAll()[0];
    console.log(currentUser);
    this.navigationService.purchaseHistoryComponentInputUser = currentUser;
    this.navigationService.openPointItemModal();
  }

  clearPurchaseHistoryComponentInputUser(event) {
    console.log(event);
    this.navigationService.purchaseHistoryComponentInputUser = null;
  }
}
