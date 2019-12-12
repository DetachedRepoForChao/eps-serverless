import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {EntityUserModel} from '../../entity-store/user/state/entity-user.model';
import {HttpClient} from '@angular/common/http';
import {ImageService} from '../../shared/image.service';
import {Globals} from '../../globals';
import {LeaderboardService} from '../../shared/leaderboard.service';
import {FeedcardService} from '../../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import {UserService} from '../../shared/user.service';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {UserHasStoreItemService} from '../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {UserHasStoreItemQuery} from '../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {StoreItemService} from '../../entity-store/store-item/state/store-item.service';
import {MetricsService} from '../../entity-store/metrics/state/metrics.service';
import {AuthService} from '../../login/auth.service';
import {FeatureService} from '../../entity-store/feature/state/feature.service';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
// import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {NotifierService} from 'angular-notifier';
import Auth from '@aws-amplify/auth';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {environment} from '../../../environments/environment';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs-compat/operator/switchMap';
import {take, takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  componentName = 'profile.component';
  isImageLoading: boolean;
  private currentUserLoading$ = new Subject();
  private usersLoading$ = new Subject();
  private unsubscribe$ = new Subject();
  leaderboardUsers$: Observable<EntityUserModel[]>;
  otherUser: false;
  user$: Observable<any> = null;
  users: EntityUserModel[];
  leaderboardUsers: EntityUserModel[];
  currentUser: EntityCurrentUserModel;
  profileUser: EntityUserModel;
  otherUserId: null;
  pendingBalance$;
  currentUser$: Observable<EntityCurrentUserModel[]>;
  isCardLoading: boolean;
  email;
  phone;
  currentView = 'editProfile';
  viewItems = [
    'editProfile',
    'changePassword',
    'privacySettings',
  ];

  public option;

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              private router: Router,
              private spinner: NgxSpinnerService,
              private globals: Globals,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private currentUserStore: CurrentUserStore,
              public currentUserQuery: EntityCurrentUserQuery,
              private currentUserService: EntityCurrentUserService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private storeItemService: StoreItemService,
              private userHasStoreItemService: UserHasStoreItemService) {
    console.log(this.router.getCurrentNavigation().extras);
    if (this.router.getCurrentNavigation().extras.state) {
      this.option = this.router.getCurrentNavigation().extras.state.option;
    }
  }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log('route');
    console.log(this.route);

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

/*    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log(params);
      this.user$ = this.userQuery.selectAll({
          filterBy: e => e.username === params.get('username')
        });

      this.user$.subscribe(user => {
        console.log(user);
      });
    });*/

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.users = users;
              this.route.paramMap
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((params: ParamMap) => {
                  this.profileUser = this.users.find(x => x.username === params.get('username'));
              });
            });

          this.userQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1,
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.leaderboardUsers = users;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });



    this.isImageLoading = false;
    this.isCardLoading = false;
  }


  onViewItemClick(clickedItem: string) {
    if (this.currentView === clickedItem) {
      // Already there, do nothing.
    } else {
      for (const item of this.viewItems) {
        if (item === clickedItem) {
          this.currentView = clickedItem;
          document.getElementById(`viewItem_${item}`).className = document.getElementById(`viewItem_${item}`).className += ' toggled';
        } else {
          document.getElementById(`viewItem_${item}`).className = document.getElementById(`viewItem_${item}`).className.replace('toggled', '').trim();
        }
      }
    }
  }

  clearOption(event) {
    this.option = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
  }

}


