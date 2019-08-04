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
import {GiftPointsService} from './gift-points.service';
import {NgxSpinnerService} from 'ngx-spinner';

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
  styleUrls: ['./gift-points.component.scss']
})
export class GiftPointsComponent implements OnInit {
  componentName = 'gift-points.component';
  // departmentEmployees = [];
  // department: Department;
  displayedColumns: string[] = ['select', 'avatar', 'name', 'username', 'email', 'position', 'points'];
  selection = new SelectionModel<DepartmentEmployee>(true, []);
  // dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList: PointItem[] = [];
  filteredPointItemList: PointItem[] = [];
  selectedPointItem = {};
  selectedEmployees = [];
  selectedCoreValues = [];
  isCardLoading: boolean;

  constructor(
    private departmentService: DepartmentService,
    private globals: Globals,
    private userService: UserService,
    private pointItemService: PointItemService,
    private router: Router,
    private achievementComponent: AchievementComponent,
    private achievementService: AchievementService,
    private notifierService: NotifierService,
    private leaderboardService: LeaderboardService,
    private giftPointsService: GiftPointsService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: setting isCardLoading to true:`);
    this.isCardLoading = true;
    this.spinner.hide('gift-points-spinner');
    const observables: Observable<any>[] = [];

    this.pointItemService.getPointItems()
      .subscribe((pointItems: any) => {
        console.log(`${functionFullName}: Populating Point Items`);
        for ( let i = 0; i < pointItems.length; i++) {
          const coreValues: string[] = pointItems[i].coreValues.split(';');
          for (let j = 0; j < coreValues.length; j++) {
            coreValues[j] = coreValues[j].trim();
          }

          const pointItem: PointItem = {
            Id: pointItems[i].id,
            Name: pointItems[i].name,
            Description: pointItems[i].description,
            Amount: pointItems[i].amount,
            CoreValues: coreValues
          };

          console.log(pointItem);

/*
          const data = {
            id: pointItems[i].id,
            name: pointItems[i].name,
            description: pointItems[i].description,
            amount: pointItems[i].amount,
            coreValues: pointItems[i].coreValues
          };
*/

          // this.pointItemList = this.pointItemList.concat(data);
          this.pointItemList.push(pointItem);
        }

        this.filteredPointItemList = this.pointItemList;

        this.giftPointsService.populateEmployeeDataSource().subscribe(() => {
          console.log(`${functionFullName}: setting isCardLoading to false:`);
          this.isCardLoading = false;
          this.spinner.hide('gift-points-spinner');
        });

/*        console.log(`${functionFullName}: setting isCardLoading to false:`);
        this.isCardLoading = false;
        this.spinner.hide('gift-points-spinner');*/
      });

    /*observables.push(this.giftPointsService.populateEmployeeDataSource());
    observables.push(this.pointItemService.getPointItems());

    forkJoin(observables)
      .subscribe(obsResults => {
        console.log(`${functionFullName}: obsResults:`);
        console.log(obsResults);

        // Iterate over the returned values from the observables so we can act appropriately on each
        obsResults.forEach(y => {
          console.log(`${functionFullName}: y:`);
          console.log(y);
        });

        const obsResult = obsResults.find(x => x[0].amount);
        console.log(`${functionFullName}: obsResult:`);
        console.log(obsResult);

        const pointItems = obsResult;
        for ( let i = 0; i < pointItems.length; i++) {
          const data = {
            id: pointItems[i].id,
            name: pointItems[i].name,
            description: pointItems[i].description,
            amount: pointItems[i].amount,
          };

          this.pointItemList = this.pointItemList.concat(data);
        }

        // this.dataSource = this.giftPointsService.dataSource;

        console.log(`${functionFullName}: setting isCardLoading to false:`);
        this.isCardLoading = false;
        this.spinner.hide('gift-points-spinner');
      });*/

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.giftPointsService.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.giftPointsService.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DepartmentEmployee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  pointItemOnSubmit(form: NgForm) {
    const functionName = 'pointItemOnSubmit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    if (!form.value['selectedPointItem'] || (this.selection.selected.length === 0)) {
    } else {

      console.log('pointItemOnSubmit');
      console.log('form.value[selectedPointItem].id: ' + form.value['selectedPointItem'].Id);
      console.log('form.value[selectedPointItem].name: ' + form.value['selectedPointItem'].Name);
      console.log('form.value[selectedPointItem].amount: ' + form.value['selectedPointItem'].Amount);
      const data = {
        sourceUserId: +localStorage.getItem('userId'),
        pointItemId: form.value['selectedPointItem'].Id,
        amount: form.value['selectedPointItem'].Amount,
      };

      const pointItems: any[] = [];
      for ( let i = 0; i < this.selection.selected.length; i++) {
        console.log('gifting points to: ' + this.selection.selected[i].email);
        pointItems.push(this.pointItemService.giftPointsToEmployee(data.sourceUserId, this.selection.selected[i].id, data.pointItemId, 'Test'));
      }

      forkJoin(pointItems)
        .subscribe(dataArray => {
          console.log('forkJoin');
          console.log(dataArray);
          this.giftPointsService.populateEmployeeDataSource().subscribe();
          this.pointItemService.storeRemainingPointPool().subscribe();
          this.leaderboardService.getPointsLeaderboard()
            .subscribe(leaderboardData => {
              console.log(`${functionFullName}: populating leaderboard data`);
              this.leaderboardService.populateLeaderboardDataSource(leaderboardData).subscribe(() => {
                console.log(`${functionFullName}: leaderboard data populated`);
              });
            });
          this.resetForm(form);
          // const userId: number = +localStorage.getItem('userId');
          // this.achievementService.incrementAchievementGiftFirstPointItem(userId)
/*          this.achievementService.incrementAchievement('GiftFirstPointItem', userId)
            .subscribe((achievementResponse: any) => {
              if (achievementResponse.status === true) {
                console.log('Gift First Point Item Successful');
                this.notifierService.notify('success', 'Congratulations! You just gave your first points!', 'THAT_NOTIFICATION_ID');
              }
            });*/
        });
    }
  }

  toggleCoreValue(coreValue: string) {
    const functionName = 'toggleCoreValue';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    if (this.selectedCoreValues.find(x => x === coreValue)) {
      // Core value already toggled. Remove it from the list
      const index = this.selectedCoreValues.indexOf(coreValue);
      console.log(`${functionFullName}: Selected Core Values filtered:`);
      console.log(this.selectedCoreValues.filter(x => x !== coreValue));
      this.selectedCoreValues = this.selectedCoreValues.filter(x => x !== coreValue);
    } else {
      // Core value toggled. Adding it to the list
      console.log(`${functionFullName}: Adding Core Value ${coreValue}`);
      this.selectedCoreValues.push(coreValue);
    }

    console.log(`${functionFullName}: New Core Value list:`);
    console.log(this.selectedCoreValues);

    this.filterPointItemList(this.selectedCoreValues);
  }

  filterPointItemList(coreValues: string[]) {
    const functionName = 'filterPointItemList';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    if (coreValues.length === 0) {
      // No Core Values are selected. Display all point items
      this.filteredPointItemList = this.pointItemList;
    } else {
      const filteredPointItemList = [];
      for (let i = 0; i < this.pointItemList.length; i++ ) {
        for (let j = 0; j < coreValues.length; j++) {
          if (this.pointItemList[i].CoreValues.find(x => x === coreValues[j])) {
            if (filteredPointItemList.indexOf(this.pointItemList[i]) === -1) {
              filteredPointItemList.push(this.pointItemList[i]);
            }
          }
        }
      }

      this.filteredPointItemList = filteredPointItemList;
    }
  }

  selectPointItem(pointItem: any) {
    const functionName = 'selectPointItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(pointItem);
  }

  resetForm(form: NgForm) {
    const functionName = 'resetForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    form.resetForm();
  }


}
