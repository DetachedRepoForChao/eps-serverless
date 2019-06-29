import {Component, Injectable, OnInit } from '@angular/core';
import { Achievement} from './achievement.model';
import { UserAchievementProgress} from './user-achievement-progress.model';
import { AchievementService} from './achievement.service';
import { Globals} from '../../globals';
import {MatTableDataSource} from '@angular/material';
import {DepartmentEmployee} from '../../user/manager-user/gift-points/gift-points.component';
import {Observable, forkJoin} from 'rxjs';
import {Router} from '@angular/router';

export interface AchievementData {
  name: string;
  goal: number;
  progress: number;
  status: string;
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

  dataSource = new MatTableDataSource<AchievementData>();
  achievements: Achievement[];
  userAchievementProgressList: UserAchievementProgress[];
  achievementDataList = [];
  displayedColumns: string[] = ['name', 'progress'];
  displayedCompletedColumns: string[] = ['name', 'completed'];
  isCompletedRow = (index, item) => item.status === 'complete';

  constructor(private globals: Globals,
              private achievementService: AchievementService,
              private router: Router) { }

  ngOnInit() {
    this.achievementService.getUserAchievementProgressByUserId(localStorage.getItem('userId'))
      .subscribe(result => {
        this.getUserAchievements();
        console.log('onInit after getUserAchievements:');
        console.log(this.dataSource.data);
      });

    console.log('onInit after getUserAchievements:');
    console.log(this.dataSource.data);
  }

  getUserAchievements() {
    console.log('getUserAchievements');
    return this.achievementService.getUserAchievementProgressByUserId(localStorage.getItem('userId'))
      .subscribe(data => {
        if (!data) {
          console.log('No data returned');
          return {status: false, message: 'No data returned'};
        } else {
          console.log('Data returned successfully');
          this.achievementDataList = [];
          const observables: Observable<any>[] = [];
          // Get the associated Achievement details
          console.log(data['userAchievementProgress']);
          for (let i = 0; i < data['userAchievementProgress'].length; i++) {
            const currentAchievementProgressItem = data['userAchievementProgress'][i];
            console.log('currentAchievementProgressItem');
            console.log(currentAchievementProgressItem);
            observables.push(this.achievementService.getAchievementById(currentAchievementProgressItem.achievement_id));
          }

          return forkJoin(observables)
            .subscribe(dataArray => {
              console.log('forkJoin');
              console.log(' data[\'userAchievementProgress\']');
              console.log( data['userAchievementProgress']);

              dataArray.forEach(item => {
                const currentAchievementProgressItem = data['userAchievementProgress'].find(x => x.achievement_id === item['achievement'].id);

                const achievementData: AchievementData = {
                  name: item['achievement'].name,
                  goal: item['achievement'].cost,
                  progress: currentAchievementProgressItem.goalProgress,
                  status: currentAchievementProgressItem.status
                };

                this.achievementDataList = this.achievementDataList.concat(achievementData);

              });

              this.dataSource.data = this.achievementDataList;
              console.log('START this.dataSource.data');
              console.log(this.dataSource.data);
              console.log('END this.dataSource.data');
              return {status: true, message: 'Datasource updated successfully'};
            });
        }
      });
  }

  refresh() {
    this.getUserAchievements();
    this.router.navigate(['/']);
  }

}
