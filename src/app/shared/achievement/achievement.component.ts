import {Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Achievement} from './achievement.model';
import { UserAchievementProgress} from './user-achievement-progress.model';
import { Globals} from '../../globals';
import {MatTableDataSource} from '@angular/material';
import {DepartmentEmployee} from '../../user/manager-user/gift-points/gift-points.component';
import {Observable, forkJoin} from 'rxjs';
import {Router} from '@angular/router';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {AchievementModel} from '../../entity-store/achievement/state/achievement.model';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {FeatureService} from '../../entity-store/feature/state/feature.service';
import {FeatureQuery} from '../../entity-store/feature/state/feature.query';



@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent implements OnInit {
  componentName = 'achievement.component';

  public config: PerfectScrollbarConfigInterface = {};
  achievements$;
  families;
  keys;
  features$;
  // @ViewChild(PerfectScrollbarComponent, { static: false }) componentRef?: PerfectScrollbarComponent;
  // @ViewChild(PerfectScrollbarDirective, { static: false }) directiveRef?: PerfectScrollbarDirective;

  constructor(private globals: Globals,
              private achievementService: AchievementService,
              private router: Router,
              private achievementQuery: AchievementQuery,
              private featureService: FeatureService,
              private featureQuery: FeatureQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.achievements$ = this.achievementQuery.selectAll({
      sortBy: 'family'
    });

    this.achievementQuery.selectAll()
      .subscribe(result => {
        this.families = this.groupBy(result, 'family');
        this.keys = Object.keys(this.families);
      });

    this.featureService.cacheFeatures().subscribe(() => {
      this.features$ = this.featureQuery.selectAll();
    });

/*    this.achievementQuery.getAchievementFamilies()
      .pipe(tap(families => {
        this.keys = Object.keys(families);
      }))
      .subscribe();*/
    // this.keys = Object.keys(this.achievementQuery.getAchievementFamilies());
    console.log(this.keys);
/*    this.achievementService.getUserAchievements().subscribe((result: any) => {
      if (result.status === true) {
        console.log(`${functionFullName}: achievement data populated successfully`);
        console.log(`${functionFullName}: after getUserAchievements:`);
        console.log(this.achievementService.achievementDataList);
      } else {
        console.log(`${functionFullName}: error populating achievement data`);
      }
    });*/
  }

  // groupBy function reference: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
  // I'm not sure why or how this works...
  groupBy (xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
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
        // $('#achievementModal').modal('hide');
      });
  }

}
