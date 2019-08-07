import {Component, Injectable, OnInit } from '@angular/core';
import { Achievement} from './achievement.model';
import { UserAchievementProgress} from './user-achievement-progress.model';
import { AchievementService} from './achievement.service';
import { Globals} from '../../globals';
import {MatTableDataSource} from '@angular/material';
import {DepartmentEmployee} from '../../user/manager-user/gift-points/gift-points.component';
import {Observable, forkJoin} from 'rxjs';
import {Router} from '@angular/router';

export interface AchievementItem {
  Name: string;
  Description: string;
  Cost: number;
  Progress: number;
  AchievementStatus: string;
  ProgressStatus: string;
}

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
  // dataSource = new MatTableDataSource<AchievementItem>();
  achievements: Achievement[];
  userAchievementProgressList: UserAchievementProgress[];
  // userAchievements: Achievement[];

  achievementDataList: AchievementItem[];
  displayedColumns: string[] = ['name', 'progress'];
  displayedCompletedColumns: string[] = ['name', 'completed'];
  isCompletedRow = (index, item) => item.status === 'complete';

  constructor(private globals: Globals,
              private achievementService: AchievementService,
              private router: Router) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.achievementService.getUserAchievements().subscribe((result: any) => {
      if (result.status === true) {
        console.log(`${functionFullName}: achievement data populated successfully`);
        console.log(`${functionFullName}: after getUserAchievements:`);
        console.log(this.achievementService.achievementDataList);
      } else {
        console.log(`${functionFullName}: error populating achievement data`);
      }
    });
  }

  refresh() {
    this.achievementService.getUserAchievements();
    this.router.navigate(['/']);
  }

}
