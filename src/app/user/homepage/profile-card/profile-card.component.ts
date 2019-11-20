import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {GALLERY_IMAGE} from 'ngx-image-gallery';
import {LeaderboardService, LeaderboardUser} from '../../../shared/leaderboard.service';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {Auth, Storage} from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {NgxSpinnerService} from 'ngx-spinner';
// import {AchievementService} from '../../../shared/achievement/achievement.service';
import {UserService} from '../../../shared/user.service';
import {CurrentUserStore} from '../../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {MetricsService} from '../../../entity-store/metrics/state/metrics.service';
import {AuthService} from '../../../login/auth.service';
import {UserHasStoreItemQuery} from '../../../entity-store/user-has-store-item/state/user-has-store-item.query';
import {UserHasStoreItemService} from '../../../entity-store/user-has-store-item/state/user-has-store-item.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {FeatureService} from '../../../entity-store/feature/state/feature.service';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {
  componentName = 'profile-card.component';
  isImageLoading: boolean;
  leaderboardUsers$: Observable<EntityUserModel[]>;
  myData = [
    ['happy', 5],
    ['fun', 7],
    ['genuine', 3],
    ['caring', 5],
    ['respect', 3],
    ['honest', 4]
  ];
  coreValueData$: Observable<any[]>;
  coreValues: string[] = ['happy', 'fun', 'genuine', 'caring', 'respect', 'honest'];
  myColumnNames = ['Core Value', 'Amount'];
  options = {
    width: 350,
    height: 350,
    colors: ['#dd97e0', '#8762e6', '#d528ec', '#8129f3', '#f6c7b6', '#4fdef3'],
    backgroundColor: 'transparent',
    legend: 'none',
    pieSliceText: 'label',
    pieSliceTextStyle: {
      color: 'black'
    },
    pieSliceBorderColor: 'transparent',
/*    slices: {
      1: {offset: 0.1},
      2: {offset: 0.1},
      3: {offset: 0.1},
      4: {offset: 0.1},
      5: {offset: 0.1}
    }*/
  };

  pendingBalance$;
  currentUser$;
  currentUser;
  pointItemTransactions$;
  isCardLoading: boolean;

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private leaderboardService: LeaderboardService,
              private feedcardService: FeedcardService,
              private spinner: NgxSpinnerService,
              private achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private userService: UserService,
              private currentUserStore: CurrentUserStore,
              public currentUserQuery: EntityCurrentUserQuery,
              private entityCurrentUserService: EntityCurrentUserService,
              private sanitizer: DomSanitizer,
              private entityUserService: EntityUserService,
              private entityUserQuery: EntityUserQuery,
              private userHasStoreItemService: UserHasStoreItemService,
              private userHasStoreItemQuery: UserHasStoreItemQuery,
              private storeItemService: StoreItemService,
              private metricsService: MetricsService,
              private authService: AuthService,
              private changeDetector: ChangeDetectorRef,
              private featureService: FeatureService,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemTransactionService: PointItemTransactionService
              ) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-spinner');

/*      const text_max = 200;
    $('#count_message').html(text_max + ' remaining');

    $('#text').keyup(function() {
      const text_length = $('#text').val().length;
      const text_remaining = text_max - text_length;

      $('#count_message').html(text_remaining + ' remaining');
    });*/


    this.currentUser$ = this.currentUserQuery.selectAll();
    this.entityUserService.cacheUsers().subscribe();
    // this.featureService.cacheFeatures().subscribe().unsubscribe();
    this.leaderboardUsers$ = this.entityUserQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.pointItemService.cachePointItems().subscribe();
    this.pointItemTransactionService.cachePointItemTransactions().subscribe();

    this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll();
    this.pointItemTransactions$.subscribe(() => {
      this.coreValueData$ = this.getCoreValues();
    });




    // this.pendingBalance$ = this.entityCurrentUserService.getPendingBalance();
    this.isImageLoading = false;
    this.isCardLoading = false;
    this.spinner.hide('profile-card-spinner');
  }

  populateCoreValueData() {
    // this.pointItemQuery.sele
  }

  getCoreValues(): Observable<any[]> {
    const coreValueArray = [
      ['happy', 1],
      ['fun', 1],
      ['genuine', 1],
      ['caring', 1],
      ['respect', 1],
      ['honest', 1]
    ];

    return new Observable<any[]>(observer => {
      this.pointItemTransactionQuery.selectAll()
        .subscribe(transactions => {
          for (const transaction of transactions) {
            console.log(transaction);
            this.pointItemQuery.selectAll({
              filterBy: (e => e.itemId === transaction.pointItemId)
            })
              .subscribe(pointItem => {
                const coreValues = pointItem[0].coreValues;
                for (const coreValue of coreValues) {
                  const coreValueItem = coreValueArray.find(x => x[0] === coreValue);
                  coreValueItem[1] = +coreValueItem[1] + 1;
                }
              });
          }

          // coreValueArray = coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; });
          console.log(coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; }));
          observer.next(coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; }));
          observer.complete();
        });
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
}
