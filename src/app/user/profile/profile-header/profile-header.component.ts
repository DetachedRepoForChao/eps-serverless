import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
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
import {takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css']
})
export class ProfileHeaderComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();
  private userLoading$ = new Subject();

  leaderboardUsers$: Observable<EntityUserModel[]>;
  currentUser$: Observable<EntityCurrentUserModel[]>;

  currentUser: EntityCurrentUserModel;
  leaderboardUsers: EntityUserModel[];

  constructor(private currentUserService: EntityCurrentUserService,
              private userService: EntityUserService,
              private achievementService: AchievementService,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService,
              public userQuery: EntityUserQuery,
              public currentUserQuery: EntityCurrentUserQuery,
              public achievementQuery: AchievementQuery) { }

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

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.userLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1,
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.leaderboardUsers = users;
            });

          this.userLoading$.next();
          this.userLoading$.complete();
        }
      });
  }


  getFirstDigit(number: number) {
    const one = String(number).charAt(0);
    return Number(one);
  }

  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.userLoading$.next();
    this.userLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
