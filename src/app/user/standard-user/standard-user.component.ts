import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { SecurityRoleService} from '../../shared/securityRole.service';
import { DepartmentService} from '../../shared/department.service';
import { Router } from '@angular/router';
import {map} from 'rxjs/operators';
import { Globals} from '../../globals';
import { NotifierService} from 'angular-notifier';
import {AchievementService} from '../../shared/achievement/achievement.service';
import {AchievementComponent} from '../../shared/achievement/achievement.component';

@Component({
  selector: 'app-standard-user',
  templateUrl: './standard-user.component.html',
  styleUrls: ['./standard-user.component.css']
})
export class StandardUserComponent implements OnInit {

  constructor(
    public globals: Globals,
    private userService: UserService,
    private router: Router,
    private departmentService: DepartmentService,
    private notifierService: NotifierService,
    private achievementComponent: AchievementComponent,
    private achievementService: AchievementService) { }

  ngOnInit() {
    if ( !localStorage.getItem('departmentName')) {
      this.storeDepartmentName();
    }

    this.getUserPoints();
    this.achievementComponent.getUserAchievements();
  }


  getDepartment() {
    const departmentId = +localStorage.getItem('departmentId');
    console.log('standard login: getDepartment id: ' + departmentId);
    return this.departmentService.getDepartmentById(departmentId);
  }

  storeDepartmentName() {
    this.getDepartment()
      .subscribe(data => {
        localStorage.setItem('departmentName', data['department'].name);
      });
  }

  getUserPoints() {
    console.log('getUserPoints');
    const oldPoints = +localStorage.getItem('points');
    this.userService.getUserPoints()
      .then((data: any) => {
        const newPoints = data.points;
        console.log('points: ' + newPoints);
        if (newPoints !== 0) {
          //this.achievementService.incrementAchievementReceiveFirstPointItem(+localStorage.getItem('userId'))
/*
          this.achievementService.incrementAchievement('ReceiveFirstPointItem', +localStorage.getItem('userId'))
            .subscribe((achievementResult: any) => {
              if (achievementResult.status === true) {
                console.log('Received First Point Item Achievement Success');
                this.notifierService.notify('success', 'Congratulations! You just received your first points!');
              }
            });
*/

        }

        if (!oldPoints) {
          localStorage.setItem('points', newPoints);
        } else if ( newPoints !== oldPoints) {
          console.log('old points amount: ' + oldPoints);
          console.log('new points amount: ' + newPoints);
          const pointDiff = newPoints - oldPoints;
          this.notifierService.notify('success', 'You received ' + pointDiff + ' pts!', 'POINT_NOTIFICATION_ID');
          localStorage.setItem('points', newPoints);

        }
      });
  }


  onLogout() {
    this.userService.deleteToken();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
