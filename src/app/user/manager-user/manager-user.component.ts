import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import { UserService } from '../../shared/user.service';
import {DepartmentService} from '../../shared/department.service';
import {PointItemService} from '../../shared/point-item.service';
import {AchievementComponent} from '../../shared/achievement/achievement.component';
import {AchievementService} from '../../shared/achievement/achievement.service';

@Component({
  selector: 'app-manager-user',
  templateUrl: './manager-user.component.html',
  styleUrls: ['./manager-user.component.css']
})
export class ManagerUserComponent implements OnInit {
  componentName = 'manager-user.component';
  remainingPointPool;

  constructor(public globals: Globals,
              private userService: UserService,
              private router: Router,
              private departmentService: DepartmentService,
              private pointItemService: PointItemService,
              private achievementComponent: AchievementComponent,
              private achievementService: AchievementService) { }

  ngOnInit() {
    const functionName = 'getPointItems';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.pointItemService.getRemainingPointPool()
      .subscribe(remainingPoints => {
          console.log(`${functionFullName}: remainingPoints: ` + remainingPoints);
          // console.log(data);
          localStorage.setItem('remainingPointPool', remainingPoints);
          this.remainingPointPool = remainingPoints;
        }
      );
    this.achievementService.getUserAchievements();
  }



  onLogout() {
    this.userService.deleteToken();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  storeRemainingPointPool() {
    console.log('storeRemainingPointPool');
    return this.pointItemService.getRemainingPointPool()
      .subscribe(data => {
        console.log('storeRemainingPointPool remainingPointPool:');
        console.log(data);
        localStorage.setItem('remainingPointPool', data);
        this.remainingPointPool = data;
        return true;
        }
      );

}
}
