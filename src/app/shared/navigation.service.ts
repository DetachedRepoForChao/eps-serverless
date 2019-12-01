import { Injectable } from '@angular/core';
import {ID, resetStores} from '@datorama/akita';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import {Router} from '@angular/router';
import {EntityUserModel} from '../entity-store/user/state/entity-user.model';
import {EntityCurrentUserModel} from '../entity-store/current-user/state/entity-current-user.model';
import {AchievementService} from '../entity-store/achievement/state/achievement.service';
import {AuthService} from '../login/auth.service';
import {PointItemTransactionService} from '../entity-store/point-item-transaction/state/point-item-transaction.service';
import {OtherUserAchievementService} from '../entity-store/other-user-achievement/state/other-user-achievement.service';

declare var $: any;

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public pointItemComponentInputUser: EntityUserModel;
  public pointItemModalActive = false;
  public achievementComponentInputUser: EntityUserModel;
  public achievementModalActive = false;
  public purchaseHistoryComponentInputUser: EntityCurrentUserModel;
  public purchaseHistoryModalActive = false;

  constructor(private router: Router,
              private achievementService: AchievementService,
              private otherUserAchievementService: OtherUserAchievementService,
              private pointItemTransactionService: PointItemTransactionService,
              private authService: AuthService) {
  }

  openPointItemModal() {
    console.log('opening point-item modal');
    console.log(`navigation service component... showing #pointItemModal with the following user input:`);
    console.log(this.pointItemComponentInputUser);
    this.pointItemModalActive = true;
    $('#pointItemModal').modal('show');
  }


  closePointItemModal() {
    console.log('closing point-item modal');
    this.pointItemModalActive = false;
    $('#pointItemModal').modal('hide');
  }

  openAchievementModal() {
    console.log('opening achievement modal');
    console.log(`navigation service component... showing #achievementModal with the following user input:`);
    console.log(this.achievementComponentInputUser);
    this.achievementModalActive = true;
    $('#achievementModal').modal('show');
  }

  closeAchievementModal() {
    console.log('closing achievement modal');
    this.achievementModalActive = false;
    $('#achievementModal').modal('hide');
  }

  openPurchaseHistoryModal() {
    console.log('opening purchase history modal');
    console.log(`navigation service component... showing #purchaseHistoryModal with the following user input:`);
    console.log(this.purchaseHistoryComponentInputUser);
    this.purchaseHistoryModalActive = true;
    $('#purchaseHistoryModal').modal('show');
  }

  closePurchaseHistoryModal() {
    console.log('closing purchase history modal');
    this.purchaseHistoryModalActive = false;
    $('#purchaseHistoryModal').modal('hide');
  }

  navigateToProfile(username) {
    console.log(`navigate to /user/profile/${username}`);
    this.router.navigate(['/', 'user', 'profile', username]).then();
  }

  onLogout() {
    this.achievementService.incrementAchievement('SignOut').subscribe();
    this.resetState();
    this.pointItemTransactionService.resetState();
    this.otherUserAchievementService.resetState();
    this.authService.signOut().then();
    resetStores();
    this.router.navigate(['/login']).then();
  }

  resetState() {
  this.pointItemComponentInputUser = null;
    this.pointItemModalActive = false;
    this.achievementComponentInputUser = null;
    this.achievementModalActive = null;
    this.purchaseHistoryComponentInputUser = null;
    this.purchaseHistoryModalActive = null;
  }
}
