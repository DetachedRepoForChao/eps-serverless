import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
// import {AchievementItem, AchievementService} from '../../../shared/achievement/achievement.service';
import {AchievementModel} from '../../../entity-store/achievement/state/achievement.model';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';
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

  subscription = new Subscription();
  private achievementsLoading$ = new Subject();
  private currentUserLoading$ = new Subject();
  filteredAchievements$: Observable<AchievementModel[]>;
  achievements: AchievementModel[];
  filteredAchievements: AchievementModel[];
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


    this.achievementQuery.selectLoading()
      .pipe(takeUntil(this.achievementsLoading$))
      .subscribe(isLoading => {
        console.log('achievements loading: ' + isLoading);
        if (!isLoading) {
          this.subscription.add(
            this.achievementQuery.selectAll()
              .subscribe(achievements => {
                this.achievements = achievements;
                this.filteredAchievements = this.achievementQuery.getFilteredAchievementsList();
              })
          );
          this.achievementsLoading$.next();
          this.achievementsLoading$.complete();
        }
      });


    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        console.log('current user loading: ' + isLoading);
        if (!isLoading) {
          this.subscription.add(
            this.currentUserQuery.selectAll()
              .subscribe(currentUser => {
                console.log('current user changed');
                console.log(currentUser[0]);
                this.currentUser = currentUser[0];
                this.pointItemTransactionService.cacheUserPointItemTransactions(currentUser[0].userId)
                  .pipe(take(1))
                  .subscribe((result: Observable<any> | any) => {
                    if (result !== false) {
                      result.subscribe(() => {
                      });

                    } else {
                      console.log(`Cache User Point Item Transactions returned ${result}`);
                    }
                  });

                this.getCoreValues(this.currentUser.userId)
                  .pipe(take(1))
                  .subscribe(coreValues => {
                    this.coreValueData = coreValues;
                  });
              })
          );

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
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
        .pipe(take(1))
        .subscribe(coreValues => {
          console.log(coreValues);
          const keys = Object.keys(coreValues);
          for (const key of keys) {

            const coreValueItem = coreValueArray.find(x => x[0] === key);
            const value: number = coreValues[key];
            coreValueItem[1] = value;

          }

          console.log(coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; }));
          observer.next(coreValueArray.sort(function(a, b) { return +b[1] - +a[1]; }));
          observer.complete();
        });
    });
  }

  acknowledgeAchievement(achievement: AchievementModel) {
    const functionName = 'acknowledgeAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Acknowledging completed achievement:`);
    console.log(achievement);

    this.achievementService.acknowledgeAchievementComplete(achievement.progressId)
      .pipe(take(1))
      .subscribe(result => {
        console.log(`${functionFullName}: Acknowledge result:`);
        console.log(result);

        // this.achievementService.getUserAchievements().subscribe();
        $('#singleAchievementModal').modal('hide');
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
    this.subscription.unsubscribe();
    this.achievementsLoading$.next();
    this.achievementsLoading$.complete();
  }

}
