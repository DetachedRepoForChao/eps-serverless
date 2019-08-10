import { Component, OnInit } from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {AchievementItem, AchievementService} from '../../../shared/achievement/achievement.service';

@Component({
  selector: 'app-progress-card',
  templateUrl: './progress-card.component.html',
  styleUrls: ['./progress-card.component.scss']
})
export class ProgressCardComponent implements OnInit {
  componentName = 'progress-card.component';
  isCardLoading: boolean;

  constructor(private spinner: NgxSpinnerService,
              private achievementService: AchievementService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.achievementService.getUserAchievements().subscribe();
    // this.isCardLoading = true;
    // this.spinner.show('progress-card-spinner');

    // this.isCardLoading = false;
    // this.spinner.hide('progress-card-spinner');
  }

  acknowledgeAchievement(achievement: AchievementItem) {
    const functionName = 'acknowledgeAchievement';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Acknowledging completed achievement:`);
    console.log(achievement);

    this.achievementService.acknowledgeAchievementComplete(achievement.ProgressId)
      .subscribe(result => {
        console.log(`${functionFullName}: Acknowledge result:`);
        console.log(result);

        this.achievementService.getUserAchievements().subscribe();
      });
  }
}
