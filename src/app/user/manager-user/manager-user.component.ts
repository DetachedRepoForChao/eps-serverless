import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import { UserService } from '../../shared/user.service';
import {DepartmentService} from '../../shared/department.service';
import {PointItemService} from '../../shared/point-item.service';
import {AchievementComponent} from '../../shared/achievement/achievement.component';

@Component({
  selector: 'app-manager-user',
  templateUrl: './manager-user.component.html',
  styleUrls: ['./manager-user.component.css']
})
export class ManagerUserComponent implements OnInit {

  remainingPointPool;

  constructor(public globals: Globals,
              private userService: UserService,
              private router: Router,
              private departmentService: DepartmentService,
              private pointItemService: PointItemService,
              private achievementComponent: AchievementComponent) { }

  ngOnInit() {
    // this.storeDepartmentName();
    // this.storeRemainingPointPool();
    this.pointItemService.getRemainingPointPool()
      .then(data => {
          console.log('storeRemainingPointPool remainingPointPool: ' + data);
          // console.log(data);
          localStorage.setItem('remainingPointPool', data);
          this.remainingPointPool = data;
          // return true;
        }
      );
    this.achievementComponent.getUserAchievements();
  }



  onLogout() {
    this.userService.deleteToken();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  storeRemainingPointPool() {
    console.log('storeRemainingPointPool');
    return this.pointItemService.getRemainingPointPool()
      .then(data => {
        console.log('storeRemainingPointPool remainingPointPool:');
        console.log(data);
        localStorage.setItem('remainingPointPool', data);
        this.remainingPointPool = data;
        return true;
        }
      );

}
}
