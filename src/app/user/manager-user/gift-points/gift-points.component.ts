import { Component, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { Globals} from '../../../globals';
import { DepartmentService} from '../../../shared/department.service';
import { UserService} from '../../../shared/user.service';
import {User} from '../../../shared/user.model';
import { Department} from '../../../shared/department.model';
import {AchievementComponent, AchievementData} from '../../../shared/achievement/achievement.component';
import {MatTableDataSource} from '@angular/material';
import {PointItemService} from '../../../shared/point-item.service';
import {PointItem} from '../../../shared/point-item.model';
import {NgForm} from '@angular/forms';
import {componentRefresh} from '@angular/core/src/render3/instructions';
import {Router} from '@angular/router';
import {Observable, forkJoin} from 'rxjs';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {NotifierService} from 'angular-notifier';
import {LeaderboardService} from '../../../shared/leaderboard.service';

export interface DepartmentEmployee {
  id: number;
  avatar: string;
  name: string;
  username: string;
  email: string;
  position: string;
  points: number;
}

@Component({
  selector: 'app-gift-points',
  templateUrl: './gift-points.component.html',
  styleUrls: ['./gift-points.component.css']
})
export class GiftPointsComponent implements OnInit {
  departmentEmployees = [];
  department: Department;
  displayedColumns: string[] = ['select', 'avatar', 'name', 'username', 'email', 'position', 'points'];
  selection = new SelectionModel<DepartmentEmployee>(true, []);
  dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList = [];
  selectedPointItem = {};
  selectedEmployees = [];

  constructor(
    private departmentService: DepartmentService,
    private globals: Globals,
    private userService: UserService,
    private pointItemService: PointItemService,
    private router: Router,
    private achievementComponent: AchievementComponent,
    private achievementService: AchievementService,
    private notifierService: NotifierService,
    private leaderboardService: LeaderboardService) { }

  ngOnInit() {
    this.populateEmployeeDataSource();

    this.pointItemService.getPointItems()
      .subscribe(res => {
        const pointItems = res['pointItems'];
        for ( let i = 0; i < pointItems.length; i++) {
          const data = {
            id: pointItems[i].id,
            name: pointItems[i].name,
            description: pointItems[i].description,
            amount: pointItems[i].amount,
          };

          this.pointItemList = this.pointItemList.concat(data);
        }
      });

  }

  populateEmployeeDataSource() {
    if (localStorage.getItem('departmentId')) {
      this.departmentService.getEmployeesByDepartmentId(+localStorage.getItem('departmentId'))
        .subscribe(res => {
          if (res) {
            console.log('gift-points OnInit');
            console.log(res);
            this.departmentEmployees = [];
            for ( let i = 0; i < res['users'].length; i++) {
              const userData = {
                id: res['users'][i].id,
                username: res['users'][i].username,
                firstName: res['users'][i].firstName,
                lastName: res['users'][i].lastName,
                email: res['users'][i].email,
                position: res['users'][i].position,
                securityRoleId: res['users'][i].securityRoleId,
                points: res['users'][i].points,
                avatarUrl: res['users'][i].avatarUrl,
              };

              const departmentEmployee: DepartmentEmployee = {
                id: userData.id,
                avatar: userData.avatarUrl,
                name: userData.firstName + ' ' + userData.lastName,
                username: userData.username,
                email: userData.email,
                position: userData.position,
                points: userData.points,
              };

              console.log(departmentEmployee);

              this.departmentEmployees = this.departmentEmployees.concat(departmentEmployee);
            }
          }

          this.dataSource.data = this.departmentEmployees;

        });
    } else {
      console.log('departmentId does not exist in local storage');
    }

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DepartmentEmployee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  pointItemOnSubmit(form: NgForm) {
    if (!form.value['selectedPointItem'] || (this.selection.selected.length === 0)) {
    } else {

      console.log('pointItemOnSubmit');
      console.log('form.value[selectedPointItem].id: ' + form.value['selectedPointItem'].id);
      console.log('form.value[selectedPointItem].name: ' + form.value['selectedPointItem'].name);
      console.log('form.value[selectedPointItem].amount: ' + form.value['selectedPointItem'].amount);
      const data = {
        sourceUserId: +localStorage.getItem('userId'),
        pointItemId: form.value['selectedPointItem'].id,
        amount: form.value['selectedPointItem'].amount,
      };

      const observables: Observable<any>[] = [];
      for ( let i = 0; i < this.selection.selected.length; i++) {
        console.log('gifting points to: ' + this.selection.selected[i].email);
        observables.push(this.pointItemService.giftPointsToEmployee(data.sourceUserId, this.selection.selected[i].id, data.pointItemId, 'Test'));
      }

      forkJoin(observables)
        .subscribe(dataArray => {
          console.log('forkJoin');
          console.log(dataArray);
          this.populateEmployeeDataSource();
          this.pointItemService.storeRemainingPointPool();
          this.leaderboardService.populateLeaderboardDataSource();
          this.resetForm(form);
          const userId: number = +localStorage.getItem('userId');
          //this.achievementService.incrementAchievementGiftFirstPointItem(userId)
          this.achievementService.incrementAchievement('GiftFirstPointItem', userId)
            .subscribe((achievementResponse: any) => {
              if (achievementResponse.status === true) {
                console.log('Gift First Point Item Successful');
                this.notifierService.notify('success', 'Congratulations! You just gave your first points!', 'THAT_NOTIFICATION_ID');
              }
            });
        });
    }
  }

  resetForm(form: NgForm) {
    form.resetForm();
  }
}
