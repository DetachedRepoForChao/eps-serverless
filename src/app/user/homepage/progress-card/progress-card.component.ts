import {Component, OnInit, ViewChild} from '@angular/core';
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

declare var $: any;

@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss']
})
export class ProgressCardComponent implements OnInit {
  @ViewChild('chart') chart: GoogleChartComponent;
  componentName = 'progress-card.component';
  filteredAchievements$: Observable<AchievementModel[]>;
  isCardLoading: boolean;
  selectedAchievement: AchievementModel;
  pointItemTransactions$;

  coreValueData$: Observable<any[]>;
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
      text: 'value'
    }
  };

  constructor(private spinner: NgxSpinnerService,
              public achievementService: AchievementService,
              public achievementQuery: AchievementQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private pointItemTransactionService: PointItemTransactionService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.achievementService.cacheAchievements().subscribe(() => {
      this.filteredAchievements$ = this.achievementQuery.filterAchievements();
    });

    this.pointItemService.cachePointItems().subscribe();
    this.pointItemTransactionService.cachePointItemTransactions().subscribe();

    this.pointItemTransactions$ = this.pointItemTransactionQuery.selectAll();
    this.pointItemTransactions$.subscribe(() => {
      this.coreValueData$ = this.getCoreValues();
    });


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

}
