import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
// import {AchievementItem, AchievementService} from '../../../shared/achievement/achievement.service';
import {AchievementModel} from '../../../entity-store/achievement/state/achievement.model';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {PointItemTransactionQuery} from '../../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {PointItemTransactionService} from '../../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {ChartEvent, GoogleChartComponent} from 'angular-google-charts';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';

declare var $: any;

@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss']
})
export class ProgressCardComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart: GoogleChartComponent;
  componentName = 'progress-card.component';
  filteredAchievements$: Observable<AchievementModel[]>;
  isCardLoading: boolean;
  selectedAchievement: AchievementModel;
  pointItemTransactions$;

  coreValueData$: Observable<any[]>;
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

  currentUser$;
  currentUser;

  constructor(private spinner: NgxSpinnerService,
              public achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemTransactionService: PointItemTransactionService,
              private currentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.currentUserService.cacheCurrentUser().subscribe();

    this.achievementService.cacheAchievements().subscribe(() => {
      this.filteredAchievements$ = this.achievementQuery.filterAchievements();
    });

    this.pointItemService.cachePointItems().subscribe();
    // this.pointItemTransactionService.cacheCurrentUserPointItemTransactions().subscribe();


    this.currentUserQuery.selectLoading()
      .subscribe(loading => {
        console.log(`Current User loading status is ${loading}`);
        if (!loading) {
          this.currentUser$ = this.currentUserQuery.selectAll();
          this.currentUser$.subscribe(currentUser => {
            this.pointItemTransactionService.cacheUserPointItemTransactions(currentUser[0].userId)
              .subscribe((result: Observable<any> | any) => {
                if (result !== false) {
                  result.subscribe(() => {
                  });

/*                  this.pointItemTransactionQuery.selectLoading()
                    .subscribe(pointItemTransactionLoading => {
                      console.log(`Point Item Transaction loading status is ${pointItemTransactionLoading}`);
                      if (!pointItemTransactionLoading) {
                        this.coreValueData$ = this.getCoreValues(currentUser[0].userId);
                      } else {
                        console.log('ERROR: Point Item Transaction is still loading');
                      }
                    });*/
                } else {
                  console.log(`Cache User Point Item Transactions returned ${result}`);
                }
              });
          });

          if (!this.currentUser) {
            this.currentUser = this.currentUserQuery.getAll()[0];

            this.getCoreValues(this.currentUser.userId)
              .subscribe(coreValues => {
                this.coreValueData = coreValues;
              });
          }
        } else {
          console.log('ERROR: Current User is still loading');
        }
      });


  }


  getCoreValues(userId: number): Observable<any[]> {
    console.log(`getCoreValues for user id ${userId}`);
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


  /*

    getCoreValues(userId: number): Observable<any[]> {
      const coreValueArray = [
        ['happy', 1],
        ['fun', 1],
        ['genuine', 1],
        ['caring', 1],
        ['respect', 1],
        ['honest', 1]
      ];

      return new Observable<any[]>(observer => {
        if (userId) {
          this.pointItemTransactionQuery.selectAll({
            filterBy: e => e.targetUserId === userId
          })
            .subscribe(transactions => {
              for (const transaction of transactions) {
                console.log(transaction);
                this.pointItemQuery.selectAll({
                  filterBy: (e => e.itemId === transaction.pointItemId)
                })
                  .subscribe(pointItem => {
                    console.log(pointItem);
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
        } else {
          observer.error();
          observer.complete();
        }
      });
    }
  */

  acknowledgeAchievement(achievement: AchievementModel) {
    const functionName = 'acknowledgeAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Acknowledging completed achievement:`);
    console.log(achievement);

    this.achievementService.acknowledgeAchievementComplete(achievement.progressId)
      .subscribe(result => {
        console.log(`${functionFullName}: Acknowledge result:`);
        console.log(result);

        // this.achievementService.getUserAchievements().subscribe();
        $('#achievementModal').modal('hide');
      });
  }

  selectAchievement(achievement: AchievementModel) {
    const functionName = 'selectAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Selecting achievement:`);
    console.log(achievement);

    this.selectedAchievement = achievement;
  }

  ngOnDestroy(): void {

  }

}
