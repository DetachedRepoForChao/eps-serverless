import {Component, OnInit, ViewChild} from '@angular/core';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {ActivatedRoute} from '@angular/router';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {Observable} from 'rxjs';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {PointItemTransactionModel} from '../../../entity-store/point-item-transaction/state/point-item-transaction.model';
import {GoogleChartComponent} from 'angular-google-charts';
import {Order} from '@datorama/akita';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {OtherUserAchievementService} from '../../../entity-store/other-user-achievement/state/other-user-achievement.service';
import {OtherUserAchievementQuery} from '../../../entity-store/other-user-achievement/state/other-user-achievement.query';
import {OtherUserAchievementModel} from '../../../entity-store/other-user-achievement/state/other-user-achievement.model';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-other-user',
  templateUrl: './other-user.component.html',
  styleUrls: ['./other-user.component.css']
})
export class OtherUserComponent implements OnInit {
  @ViewChild('chart') chart: GoogleChartComponent;
  user$: Observable<EntityUserModel[]> = null;
  user: EntityUserModel = null;
  userId: number = null;
  leaderboardUsers$: Observable<EntityUserModel[]> = null;
  pointItemTransactions$: Observable<PointItemTransactionModel[]> = null;
  pointItemTransactions: PointItemTransactionModel[] = null;
  achievements: OtherUserAchievementModel[] = null;
  completedAchievements: OtherUserAchievementModel[] = null;

  coreValueData$;
  coreValueData;
  coreValues: string[] = ['happy', 'fun', 'genuine', 'caring', 'respect', 'honest'];
  myColumnNames = ['Core Value', 'Amount'];
  options = {
    width: 275,
    height: 275,
    colors: ['#ff8d72', '#fd5d93', '#d528ec', '#8129f3', '#00f2c3', '#4fdef3'],
    backgroundColor: 'transparent',
    chartArea: {
      backgroundColor: 'white'
    },
    legend: 'none',
    pieHole: 0.4,
    pieSliceText: 'label',
    pieSliceTextStyle: {
      color: '#ffffff'
    },
    pieSliceBorderColor: 'transparent',
    slices: {

    },
    tooltip: {
      trigger: 'selection',
      text: 'value',
      textStyle: {
        fontSize: 16,
        fontName: 'Poppins'
      }
    }
  };

  privateCoreValueData = [
    ['happy', 1],
    ['fun', 1],
    ['genuine', 1],
    ['caring', 1],
    ['respect', 1],
    ['honest', 1]
  ];

  privateOptions = {
    width: 275,
    height: 275,
    colors: ['#ff8d72', '#fd5d93', '#d528ec', '#8129f3', '#00f2c3', '#4fdef3'],
    backgroundColor: 'transparent',
    chartArea: {
      backgroundColor: 'white'
    },
    legend: 'none',
    pieHole: 0.4,
    pieSliceText: 'label',
    pieSliceTextStyle: {
      color: '#ffffff'
    },
    pieSliceBorderColor: 'transparent',
    slices: {

    },
    tooltip: {
      trigger: 'none',
    }
  };

  isUserDataRetrieved = false;
  pointItemsTransactionsRetrieving = false;
  achievementsRetrieving = false;


  constructor(private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private achievementService: AchievementService,
              private achievementQuery: AchievementQuery,
              private pointItemTransactionService: PointItemTransactionService,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private otherUserAchievementService: OtherUserAchievementService,
              private otherUserAchievementQuery: OtherUserAchievementQuery,
              private route: ActivatedRoute,
              private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.userService.cacheUsers().subscribe();
    this.achievementService.cacheAchievements().subscribe();
    this.spinner.show('other-user-spinner');

    // this.pointItemTransactionService.cacheCurrentUserPointItemTransactions().subscribe();

    this.userQuery.selectLoading()
      .subscribe(userQueryLoading => {
        console.log(`User loading status is ${userQueryLoading}`);
        if (!userQueryLoading) {
          this.user$ = this.userQuery.selectAll({
            filterBy: e => e.username === this.route.snapshot.params.username
          });

          this.user$.subscribe(user => {
            if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
              this.pointItemsTransactionsRetrieving = true;
              this.pointItemTransactionService.cacheUserPointItemTransactions(user[0].userId)
                .subscribe((result: Observable<any> | any) => {
                  if (result !== false) {
                    result.subscribe(() => {
                      this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                        filterBy: e => e.targetUserId === user[0].userId,
                        sortBy: 'createdAt',
                        sortByOrder: Order.DESC
                      });
                      console.log('point item transactions');
                      console.log(this.pointItemTransactions);
                    });

                  } else {
                    console.log(`Cache User Point Item Transactions returned ${result}`);
                    // We may have retrieved the data but the pointItemTransactions variable may be null... this accounts for that
                    if (!this.pointItemTransactions) {
                      this.pointItemTransactions = this.pointItemTransactionQuery.getAll({
                        filterBy: e => e.targetUserId === user[0].userId,
                        sortBy: 'createdAt',
                        sortByOrder: Order.DESC
                      });
                    }
                  }
                });
            } else {
              console.log(`Already retrieving point item transactions`);
            }

            if (!this.achievementsRetrieving) { // This check prevents the API call from firing more than it has to
              this.achievementsRetrieving = true;
              this.otherUserAchievementService.cacheAchievements(user[0])
                .subscribe((result: Observable<any> | any) => {
                  if (result !== false) {
                    result.subscribe(() => {
                      this.achievements = this.otherUserAchievementQuery.getAll({
                        filterBy: e => e.userId === user[0].userId,
                        sortBy: 'updatedAt',
                        sortByOrder: Order.DESC
                      });
                      console.log('achievements');
                      console.log(this.achievements);

                      this.completedAchievements = this.otherUserAchievementQuery.getAll({
                        filterBy: e => (e.userId === user[0].userId) && ((e.progressStatus === 'complete') || (e.progressStatus === 'complete acknowledged')),
                        sortBy: 'updatedAt',
                        sortByOrder: Order.DESC
                      });
                      console.log('completed achievements');
                      console.log(this.completedAchievements);
                    });

                  } else {
                    console.log(`Cache Achievements returned ${result}`);
                    // We may have retrieved the data but the achievements or completedAchievements variables may be null...
                    // this accounts for that...
                    if (!this.achievements || !this.completedAchievements) {
                      this.achievements = this.otherUserAchievementQuery.getAll({
                        filterBy: e => e.userId === user[0].userId,
                        sortBy: 'updatedAt',
                        sortByOrder: Order.DESC
                      });
                      console.log('achievements');
                      console.log(this.achievements);

                      this.completedAchievements = this.otherUserAchievementQuery.getAll({
                        filterBy: e => (e.userId === user[0].userId) && ((e.progressStatus === 'complete') || (e.progressStatus === 'complete acknowledged')),
                        // filterBy: e => (e.userId === user[0].userId) && ((e.achievementStatus === 'complete') || (e.achievementStatus === 'complete acknowledged')),

                        sortBy: 'updatedAt',
                        sortByOrder: Order.DESC
                      });
                      console.log('completed achievements');
                      console.log(this.completedAchievements);
                    }
                  }
                });
            } else {
              console.log(`Already retrieving achievements`);
            }

            // Pull user info into a static variable if this hasn't happened yet
            if (!this.user) {
              this.user = this.userQuery.getAll({
                filterBy: e => e.username === this.route.snapshot.params.username
              })[0];

              this.getCoreValues(this.user.userId)
                .subscribe(coreValues => {
                  this.coreValueData = coreValues;
                });
            }

            this.isUserDataRetrieved = true;
            this.spinner.hide('other-user-spinner');
          });
        } else {
          console.log('ERROR: User is still loading');
        }
      });

    this.leaderboardUsers$ = this.userQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });
  }

  getCoreValues(userId: number): Observable<any[]> {
    // console.log(`getCoreValues for user id ${userId}`);
    const coreValueArray = [
      ['happy', 0],
      ['fun', 0],
      ['genuine', 0],
      ['caring', 0],
      ['respect', 0],
      ['honest', 0]
    ];

    return new Observable<any[]>(observer => {
      this.pointItemTransactionService.getUserCoreValues(userId)
        .subscribe(coreValues => {
          console.log(coreValues);
          const keys = Object.keys(coreValues);
          for (const key of keys) {
            // console.log(`key: ${key}`);
            // console.log(`coreValues[key]: ${coreValues[key]}`);
            const coreValueItem = coreValueArray.find(x => x[0] === key);
            const value: number = coreValues[key];
            coreValueItem[1] = value;
            // console.log(`coreValueItem: ${coreValueItem}`);
            // console.log(`coreValueItem[1]: ${coreValueItem[1]}`);
            // debugger;
          }

          console.log(coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; }));
          observer.next(coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; }));
          observer.complete();
        });
    });
  }

}
