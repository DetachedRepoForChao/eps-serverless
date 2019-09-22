import { Component, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { Globals} from '../../../globals';
import { DepartmentService} from '../../../shared/department.service';
import { UserService} from '../../../shared/user.service';
import {User} from '../../../shared/user.model';
import { Department} from '../../../shared/department.model';
import {AchievementComponent} from '../../../shared/achievement/achievement.component';
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
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {UserStore} from '../../../entity-store/user/state/user.store';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';

export interface DepartmentEmployee {
  id: number;
  avatar: string;
  name: string;
  username: string;
  email: string;
  position: string;
  points: number;
}

export interface CoreValueButton {
  Name: string;
  Toggled: boolean;
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
  // selection = new SelectionModel<DepartmentEmployee>(true, []);
  selection = new SelectionModel<EntityUserModel>(true, []);
  // dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList: PointItem[] = [];
  filteredPointItemList: PointItem[] = [];
  // selectedPointItem = {};
  selectedEmployees = [];
  selectedCoreValues = [];
  coreValues: string[] = ['happy', 'fun', 'genuine', 'caring', 'respect', 'honest'];
  coreValueButtonList: CoreValueButton[] = [];
  selectedPointItem: PointItem;
  employees$: Observable<EntityUserModel[]>;
  isCardLoading: boolean;
  formSubmitted = false;

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
    private spinner: NgxSpinnerService,
    private entityUserService: EntityUserService,
    private userStore: UserStore,
    private entityUserQuery: EntityUserQuery,
    private entityCurrentUserQuery: EntityCurrentUserQuery,
    private entityCurrentUserService: EntityCurrentUserService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: setting isCardLoading to true:`);
    this.isCardLoading = true;
    this.spinner.hide('gift-points-spinner');
    const observables: Observable<any>[] = [];

    this.populateCoreValueButtonList();

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
            CoreValues: coreValues,
            Filtered: false
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

        this.entityUserService.cacheUsers().subscribe(() => {
          this.employees$ = this.entityUserQuery.selectAll({
            filterBy: userEntity => userEntity.securityRole.Id === 1,
          });

          this.isCardLoading = false;
          this.spinner.hide('gift-points-spinner');
        });

/*        this.giftPointsService.populateEmployeeDataSource().subscribe(() => {
          console.log(`${functionFullName}: setting isCardLoading to false:`);
          this.isCardLoading = false;
          this.spinner.hide('gift-points-spinner');
        });*/

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

  populateCoreValueButtonList() {
    const functionName = 'populateCoreValueButtonList';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    for (let i = 0; i < this.coreValues.length; i++) {
      const coreValueButton: CoreValueButton = {
        Name: this.coreValues[i],
        Toggled: false
      };

      this.coreValueButtonList.push(coreValueButton);
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.giftPointsService.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
/*  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.giftPointsService.dataSource.data.forEach(row => this.selection.select(row));
  }*/

  /** The label for the checkbox on the passed row */
/*  checkboxLabel(row?: DepartmentEmployee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }*/

  pointItemOnSubmit(form: NgForm) {
    const functionName = 'pointItemOnSubmit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

/*    if (this.formSubmitted === true) {
      console.log(`${functionFullName}: Form already submitted. Stopping...`);
    } else {*/
      // this.formSubmitted = true;
      console.log(`${functionFullName}: this.selectedPointItem:`);
      console.log(this.selectedPointItem);

      console.log(`${functionFullName}: this.selection.selected:`);
      console.log(this.selection.selected);

      if (!this.selectedPointItem || (this.selection.selected.length === 0)) {
      } else {
        const data = {
          pointItemId: this.selectedPointItem.Id,
          amount: this.selectedPointItem.Amount,
        };

        // Create an object array to send to the backend API in one bulk operation
        const userPointObjectArray = [];
        let totalAmount = 0; // Used to figure out the total amount of points that will be removed from the point pool
        // const pointItems$: Observable<any>[] = [];
        console.log('selected.length');
        console.log(this.selection.selected.length);
        for ( let i = 0; i < this.selection.selected.length; i++) {
          console.log('gifting points to: ' + this.selection.selected[i].email);
          totalAmount = totalAmount + this.selectedPointItem.Amount;

          const userPointObject = {
            userId: this.selection.selected[i].userId,
            pointItemId: this.selectedPointItem.Id,
            amount: this.selectedPointItem.Amount,
            description: 'Test',
          };

          userPointObjectArray.push(userPointObject);
          // pointItems$.push(this.pointItemService.giftPointsToEmployee(this.selection.selected[i].userId, data.pointItemId, 'Test'));
        }

        // Check if the manager has enough points in his points pool to complete the transaction
        this.entityCurrentUserQuery.getCurrentUser()
          .subscribe(currentUser => {
            if (totalAmount > currentUser[0].pointsPool) {
              console.log('Not enough points in the points pool to complete transaction. Stopping...');
            } else {
              console.log('Sufficient points in the points pool to complete the transaction. Continuing...');
              console.log(userPointObjectArray);
              this.pointItemService.giftPointsToEmployees(userPointObjectArray)
                .subscribe((giftPointsResult: any) => {
                  console.log('giftPointsResult');
                  console.log(giftPointsResult);
                  const newPointPoolAmount = giftPointsResult.newPointPoolAmount;
                  const resultObjectArray = giftPointsResult.resultObjectArray;
                  this.entityCurrentUserService.updatePointPool(+newPointPoolAmount);
                  for (let i = 0; i < resultObjectArray.length; i++) {
                    this.entityUserService.updatePoints(+resultObjectArray[i].targetUserId, +resultObjectArray[i].newPointAmount);
                  }
                  // this.formSubmitted = false;
                  // debugger;
                });
            }
          }).unsubscribe();
      }
    // }
  }

  toggleCoreValueButton(coreValue: string) {
    const functionName = 'toggleCoreValue';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: Toggling core value button: ${coreValue}`);

    const coreValueButton = this.coreValueButtonList.find(x => x.Name === coreValue);
    if (coreValueButton.Toggled) {
      console.log(`${functionFullName}: Core value button is already toggled. Untoggling`);
      coreValueButton.Toggled = false;
      document.getElementById(`button_${coreValue}`).className = document.getElementById(`button_${coreValue}`).className.replace('toggled', '').trim();
    } else {
      console.log(`${functionFullName}: Core value button is not yet toggled. Toggling`);
      coreValueButton.Toggled = true;
      document.getElementById(`button_${coreValue}`).className = document.getElementById(`button_${coreValue}`).className += ' toggled';
    }

    this.filterPointItemList();
  }

  isCoreValueButtonToggled(coreValue: string): boolean {
    const functionName = 'isCoreValueButtonToggled';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Checking if button for core value ${coreValue} is toggled`);
    const coreValueButton = this.coreValueButtonList.find(x => x.Name === coreValue);
    if (coreValueButton.Toggled) {
      return true;
    } else {
      return false;
    }
  }

  toggleCoreValue(coreValue: string) {
    const functionName = 'toggleCoreValue';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: Core value: ${coreValue}`);

    if (!this.isCoreValueToggled(coreValue)) {
      // Core value button is not toggled. Proceed
      console.log(`${functionFullName}: Core value is not yet toggled. Check if the core value exists in the core value list`);
      if (!this.selectedCoreValues.find(x => x === coreValue)) {
        // Core value not yet in the core value list. Adding it to the list
        console.log(`${functionFullName}: Core value is not yet in the core value list. Adding core value ${coreValue} to the core value list`);
        this.selectedCoreValues.push(coreValue);
      }
    } else {
      // Core value button is already toggled. Check if the core value exists in the core value list and remove it if it does
      console.log(`${functionFullName}: Core value is already toggled. Check if the core value exists in the core value list`);
      if (this.selectedCoreValues.find(x => x === coreValue)) {
        // Core value already toggled. Remove it from the list
        console.log(`${functionFullName}: Core value exists in the core value list. Removing it`);
        const index = this.selectedCoreValues.indexOf(coreValue);
        console.log(`${functionFullName}: Selected Core Values filtered:`);
        console.log(this.selectedCoreValues.filter(x => x !== coreValue));
        this.selectedCoreValues = this.selectedCoreValues.filter(x => x !== coreValue);
      }
    }

    console.log(`${functionFullName}: New Core Value list:`);
    console.log(this.selectedCoreValues);

    // this.filterPointItemList(this.selectedCoreValues);
  }

  untoggleAllCoreValueButtons() {
    const functionName = 'untoggleAllCoreValueButtons';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    for (let i = 0; i < this.coreValueButtonList.length; i++) {
      console.log(`${functionFullName}: Untoggling core value button ${this.coreValueButtonList[i].Name}`);
      this.coreValueButtonList[i].Toggled = false;
      document.getElementById(`button_${this.coreValueButtonList[i].Name}`).className = document.getElementById(`button_${this.coreValueButtonList[i].Name}`).className.replace('toggled', '').trim();
    }
  }

  filterPointItemList() {
    const functionName = 'filterPointItemList';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const toggledCoreValues = this.coreValueButtonList.filter(x => x.Toggled);
    if (toggledCoreValues.length === 0) {
      for (let i = 0; i < this.filteredPointItemList.length; i++) {
        this.filteredPointItemList[i].Filtered = false;
      }
    } else {
      for (let i = 0; i < this.filteredPointItemList.length; i++) {
        for (let j = 0; j < toggledCoreValues.length; j++) {
          if (this.filteredPointItemList[i].CoreValues.find(x => x === toggledCoreValues[j].Name)) {
            // filteredPointItem contains current toggled core value
            this.filteredPointItemList[i].Filtered = true;
          } else {
            // filteredPointItem does NOT contain current toggled core value. Break out of loop
            this.filteredPointItemList[i].Filtered = false;
            break;
          }
        }
      }
    }
  }

  selectPointItem(pointItem: PointItem) {
    const functionName = 'selectPointItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(pointItem);
    this.selectedPointItem = pointItem;
    // this.setAllButtonsInactive();
    this.untoggleAllCoreValueButtons();

    for (let i = 0; i < pointItem.CoreValues.length; i++) {
      console.log(`${functionFullName}: Toggling core value '${pointItem.CoreValues[i]}' for point item '${pointItem.Name}'`);
      this.toggleCoreValueButton(pointItem.CoreValues[i]);
/*      const element = document.getElementById(`button_${pointItem.CoreValues[i]}`);
      console.log(element);
      if (element.className.match('active')) {
        console.log(`${functionFullName}: element className contains 'active'`);

      } else {
        console.log(`${functionFullName}: element className does NOT contains 'active'`);
        document.getElementById(`button_${pointItem.CoreValues[i]}`).className += ' active';
        this.toggleCoreValue(pointItem.CoreValues[i]);
      }*/
    }
  }

  isCoreValueToggled(coreValue: string): boolean {
    const functionName = 'isCoreValueToggled';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Checking if button for core value ${coreValue} is toggled`);
    const buttonClass = document.getElementById(`button_${coreValue}`).className;
    if (buttonClass.match('active')) {
      return true;
    } else {
      return false;
    }
  }

  setAllButtonsInactive() {
    const functionName = 'setAllButtonsInactive';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    document.getElementById(`button_happy`).className = document.getElementById(`button_happy`).className.replace('active', '');
    // this.toggleCoreValue('happy');
    document.getElementById(`button_fun`).className = document.getElementById(`button_fun`).className.replace('active', '');
    // this.toggleCoreValue('fun');
    document.getElementById(`button_genuine`).className = document.getElementById(`button_genuine`).className.replace('active', '');
    // this.toggleCoreValue('genuine');
    document.getElementById(`button_caring`).className = document.getElementById(`button_caring`).className.replace('active', '');
    // this.toggleCoreValue('caring');
    document.getElementById(`button_respect`).className = document.getElementById(`button_respect`).className.replace('active', '');
    // this.toggleCoreValue('respect');
    document.getElementById(`button_honest`).className = document.getElementById(`button_honest`).className.replace('active', '');
    // this.toggleCoreValue('honest');
  }

  resetForm(form: NgForm) {
    const functionName = 'resetForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    form.resetForm();
  }


}
