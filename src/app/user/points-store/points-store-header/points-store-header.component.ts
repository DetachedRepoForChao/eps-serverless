import {AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {forkJoin, Observable, Subject, Subscription} from 'rxjs';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {NavigationService} from '../../../shared/navigation.service';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {ConfirmItemPurchaseComponent} from '../../confirm-item-purchase/confirm-item-purchase.component';
import {PointsStoreComponent} from '../points-store.component';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-points-store-header',
  templateUrl: './points-store-header.component.html',
  styleUrls: ['./points-store-header.component.css']
})
export class PointsStoreHeaderComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  public config: PerfectScrollbarConfigInterface = {};
  private subscription = new Subscription();
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  currentPurchaseRequestTabItem = 'allActive';
  purchaseRequestTabItems = [
    'allActive',
    'pending',
    'readyForPickup',
    'pickedUp',
    'archived',
  ];

  constructor(private currentUserService: EntityCurrentUserService,
              private userService: EntityUserService,
              private achievementService: AchievementService,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService,
              private userQuery: EntityUserQuery,
              public currentUserQuery: EntityCurrentUserQuery,
              private achievementQuery: AchievementQuery,
              private router: Router,
              public navigationService: NavigationService) { }

  ngOnInit() {
    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });
  }


  viewPurchaseHistory() {
    console.log('view purchase history');
  }

  showPurchaseHistoryModal() {
    console.log(`invoking points modal with the following user input:`);
    const currentUser = this.currentUserQuery.getAll()[0];
    console.log(currentUser);
    this.navigationService.purchaseHistoryModalActive = true;
    this.navigationService.purchaseHistoryComponentInputUser = currentUser;
    this.navigationService.openPurchaseHistoryModal();
  }

  clearPurchaseHistoryComponentInputUser(event) {
    console.log(event);
    this.navigationService.purchaseHistoryComponentInputUser = null;
  }

  confirmStoreItemPurchaseRequest(): void {
    console.log(`Received request to purchase store item`);
    this.router.navigate(['/', 'user', 'confirm-item-purchase']);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngAfterViewInit(): void {
    console.log('AfterViewInit');
  }

  onPurchaseRequestTabItemClick(clickedItem: string) {
    if (this.currentPurchaseRequestTabItem === clickedItem) {
      // Already there, do nothing.
    } else {
      for (const item of this.purchaseRequestTabItems) {
        if (item === clickedItem) {
          this.currentPurchaseRequestTabItem = clickedItem;
          document.getElementById(`purchaseRequestTab_${item}`).className = document.getElementById(`purchaseRequestTab_${item}`).className += ' toggled';
        } else {
          document.getElementById(`purchaseRequestTab_${item}`).className = document.getElementById(`purchaseRequestTab_${item}`).className.replace('toggled', '').trim();
        }
      }
    }
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

