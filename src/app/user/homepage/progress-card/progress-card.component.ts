import { Component, OnInit } from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
// import {AchievementItem, AchievementService} from '../../../shared/achievement/achievement.service';
import {AchievementModel} from '../../../entity-store/achievement/state/achievement.model';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss']
})
export class ProgressCardComponent implements OnInit {
  componentName = 'progress-card.component';
  filteredAchievements$: Observable<AchievementModel[]>;
  isCardLoading: boolean;
  selectedAchievement: AchievementModel;
/*  selectedAchievement: AchievementModel = {
    id: null,
    achievementId: null,
    name: null,
    description: null,
    cost: 0,
    progress: 0,
    progressId: null,
    achievementStatus: null,
    progressStatus: null,
    family: null,
    startAmount: null,
    level: null
  };*/

  constructor(private spinner: NgxSpinnerService,
              public achievementService: AchievementService,
              public achievementQuery: AchievementQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.achievementService.cacheAchievements().subscribe(() => {
      this.filteredAchievements$ = this.achievementQuery.filterAchievements();
    });

    // this.isCardLoading = true;
    // this.spinner.show('progress-card-spinner');

    // this.isCardLoading = false;
    // this.spinner.hide('progress-card-spinner');
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
