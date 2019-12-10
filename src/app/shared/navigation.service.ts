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
import {Observable} from 'rxjs';
import {UserHasStoreItemModel} from '../entity-store/user-has-store-item/state/user-has-store-item.model';
import {UserHasStoreItemQuery} from '../entity-store/user-has-store-item/state/user-has-store-item.query';
import {NotificationModel} from '../entity-store/notification/state/notification.model';

declare var $: any;

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public pointItemComponentInputUser: EntityUserModel;
  public pointItemModalActive = false;
  public achievementComponentInputUser: EntityUserModel;
  public achievementModalActive = false;
  public purchaseHistoryComponentInputUser: EntityCurrentUserModel;
  public purchaseHistoryModalActive = false;
  public purchaseRequestDataSource$: Observable<UserHasStoreItemModel[]>;
  public notificationDetailsModalActive = false;
  public notificationDetailsInput: NotificationModel;

  constructor(private router: Router,
              private achievementService: AchievementService,
              private otherUserAchievementService: OtherUserAchievementService,
              private pointItemTransactionService: PointItemTransactionService,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
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

  openNotificationDetailsModal() {
    console.log('opening notification details modal');
    console.log(`navigation service component... showing #notificationDetailsModal with the following input:`);
    console.log(this.notificationDetailsInput);
    this.notificationDetailsModalActive = true;
    $('#notificationDetailsModal').modal('show');
  }

  closeNotificationDetailsModal() {
    console.log('closing notification details modal');
    this.notificationDetailsModalActive = false;
    $('#notificationDetailsModal').modal('hide');
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

  setPurchaseRequestDataSourceAll(userId: number) {
    console.log('setPurchaseRequestDataSourceAll');
    this.purchaseRequestDataSource$ = this.userHasStoreItemQuery.selectUserRequests(userId);

  }

  setPurchaseRequestDataSourcePending(userId: number) {
    console.log('setPurchaseRequestDataSourcePending');

    this.purchaseRequestDataSource$ = this.userHasStoreItemQuery.selectUserPendingRequests(userId);

  }

  setPurchaseRequestDataSourceApproved(userId: number) {
    console.log('setPurchaseRequestDataSourceApproved');

    this.purchaseRequestDataSource$ = this.userHasStoreItemQuery.selectUserApprovedRequests(userId);

  }

  setPurchaseRequestDataSourceDeclined(userId: number) {
    console.log('setPurchaseRequestDataSourceDeclined');

    this.purchaseRequestDataSource$ = this.userHasStoreItemQuery.selectUserDeclinedRequests(userId);

  }

  setPurchaseRequestDataSourceFulfilled(userId: number) {
    console.log('setPurchaseRequestDataSourceFulfilled');

    this.purchaseRequestDataSource$ = this.userHasStoreItemQuery.selectUserFulfilledRequests(userId);

  }

  setPurchaseRequestDataSourceCancelled(userId: number) {
    console.log('setPurchaseRequestDataSourceCancelled');

    this.purchaseRequestDataSource$ = this.userHasStoreItemQuery.selectUserCancelledRequests(userId);
  }

}
