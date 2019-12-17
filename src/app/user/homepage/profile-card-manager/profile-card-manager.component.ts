import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {PointItemService} from '../../../shared/point-item.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {CurrentUserStore} from '../../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {UserService} from '../../../shared/user.service';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card-manager',
  templateUrl: './profile-card-manager.component.html',
  styleUrls: ['./profile-card-manager.component.css']
})
export class ProfileCardManagerComponent implements OnInit, OnDestroy {
  componentName = 'profile-card-manager.component';
  private unsubscribe$ = new Subject();
  private currentUserLoading$ = new Subject();

  isImageLoading: boolean;
  isCardLoading: boolean;
  currentUser$;
  currentUser: EntityCurrentUserModel;

  constructor(private router: Router,
              private imageService: ImageService,
              private leaderboardService: LeaderboardService,
              public pointItemService: PointItemService,
              private spinner: NgxSpinnerService,
              private feedcardService: FeedcardService,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private userService: UserService,
              private currentUserStore: CurrentUserStore,
              private entityUserService: EntityCurrentUserService,
              public currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    // const functionName = 'ngOnInit';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-manager-spinner');

    // this.entityUserService.cacheCurrentUser().subscribe();
    // this.currentUser$ = this.entityCurrentUserQuery.selectCurrentUser();

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              // console.log('Current user changed', currentUser);
              this.currentUser = currentUser;
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });

    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('profile-card-manager-spinner');
  }

  avatarClick() {
    $('#avatarModal').modal('show');
  }

  onSetQuoteClick(username: string) {
    this.router.navigate(['user', 'profile', username], {state: {option: 'quote'}});
  }

  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
