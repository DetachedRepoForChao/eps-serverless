import { Component, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { Globals} from '../../../globals';
import { DepartmentService} from '../../../shared/department.service';
import { UserService} from '../../../shared/user.service';
import {User} from '../../../shared/user.model';
import { Department} from '../../../shared/department.model';
import {MatTableDataSource, ThemePalette} from '@angular/material';

import {PointItem} from '../../../shared/point-item.model';
import {NgForm} from '@angular/forms';
import {componentRefresh} from '@angular/core/src/render3/instructions';
import {Router} from '@angular/router';
import {Observable, forkJoin} from 'rxjs';
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
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemModel} from '../../../entity-store/point-item/state/point-item.model';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {FreshPipe} from '../../../pipe/fresh.pipe';


declare var $: any;

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
  styleUrls: ['./gift-points.component.scss'],
})
export class GiftPointsComponent implements OnInit {
  componentName = 'gift-points.component';
  // departmentEmployees = [];
  // department: Department;
  displayedColumns: string[] = ['select', 'avatar', 'name', 'username', 'email', 'position', 'points'];
  // selection = new SelectionModel<DepartmentEmployee>(true, []);
  selection = new SelectionModel<EntityUserModel>(true, []);
  // dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList$: Observable<PointItemModel[]>;
  filteredPointItemList: PointItemModel[] = [];
  // selectedPointItem = {};
  selectedEmployees = [];
  selectedCoreValues = [];
  coreValues: string[] = ['happy', 'fun', 'genuine', 'caring', 'respect', 'honest'];
  coreValueButtonList: CoreValueButton[] = [];
  selectedPointItem: PointItemModel;
  employees$: Observable<EntityUserModel[]>;
  isCardLoading: boolean;
  formSubmitted = false;
  showLimit = 8;
  showFlag = false;
  clickedUser;

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;
  toggled = false;

  appliedFilters = [];

  constructor(
    private departmentService: DepartmentService,
    private globals: Globals,
    private userService: UserService,
    private pointItemService: PointItemService,
    private pointItemQuery: PointItemQuery,
    private router: Router,
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

    this.pointItemService.cachePointItems().subscribe();
    this.pointItemList$ = this.pointItemQuery.selectAll();
    // this.filteredPointItemList$ = this.pointItemQuery.selectAll();

    this.entityUserService.cacheUsers().subscribe();
    this.employees$ = this.entityUserQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

    this.isCardLoading = false;
    this.spinner.hide('gift-points-spinner');

    this.showLimit = 7;
  }



  onChange() {
    this.toggled = !this.toggled;
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

  pointItemOnSubmit(form: NgForm) {
    const functionName = 'pointItemOnSubmit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: this.selectedPointItem:`);
    console.log(this.selectedPointItem);

    console.log(`${functionFullName}: this.selection.selected:`);
    console.log(this.selection.selected);

    const sourceUser = this.entityCurrentUserQuery.getAll()[0];

    if (!this.selectedPointItem || (this.selection.selected.length === 0)) {
    } else {
      const data = {
        pointItemId: this.selectedPointItem.itemId,
        amount: this.selectedPointItem.amount,
      };

      // Create an object array to send to the backend API in one bulk operation
      const userPointObjectArray = [];
      let totalAmount = 0; // Used to figure out the total amount of points that will be removed from the point pool
      console.log('selected.length');
      console.log(this.selection.selected.length);
      for ( let i = 0; i < this.selection.selected.length; i++) {
        console.log('gifting points to: ' + this.selection.selected[i].username);
        totalAmount = totalAmount + this.selectedPointItem.amount;

        const userPointObject = {
          userId: this.selection.selected[i].userId,
          pointItemName: this.selectedPointItem.name,
          pointItemId: this.selectedPointItem.itemId,
          amount: this.selectedPointItem.amount,
          coreValues: this.selectedPointItem.coreValues,
          description: 'Test',
        };

        userPointObjectArray.push(userPointObject);
      }

      // Check if the manager has enough points in his points pool to complete the transaction
      const currentPointsPool = this.entityCurrentUserQuery.getCurrentUserPointsPool();
      if (totalAmount > currentPointsPool) {
        console.log('Not enough points in the points pool to complete transaction. Stopping...');
        this.selection.clear();
      } else {
        console.log('Sufficient points in the points pool to complete the transaction. Continuing...');
        console.log(userPointObjectArray);
        this.pointItemService.awardPointsToEmployees(userPointObjectArray)
          .subscribe((giftPointsResult: any) => {
            console.log('giftPointsResult');
            console.log(giftPointsResult);
            const newPointPoolAmount = giftPointsResult.newPointPoolAmount;
            const resultObjectArray = giftPointsResult.resultObjectArray;
            this.entityCurrentUserService.updatePointPool(+newPointPoolAmount);

            for (let i = 0; i < resultObjectArray.length; i++) {
              // If the backend function call returned true, update points for user and send them an email notification
              if (resultObjectArray[i].status === true) {
                const targetUser = this.selection.selected.filter(x => x.userId === resultObjectArray[i].targetUserId)[0];
                this.entityUserService.updatePoints(+resultObjectArray[i].targetUserId, +resultObjectArray[i].newPointAmount);
                this.pointItemService.sendAwardPointsEmail(targetUser, sourceUser, this.selectedPointItem)
                  .subscribe(emailResult => {
                    console.log(`${functionFullName}: email result`);
                    console.log(emailResult);
                  });
              }

            }

            this.achievementService.incrementAchievementByX('AwardPoint', resultObjectArray.length).subscribe();
            this.selection.clear();
          });
      }
    }
  }

  toggleCoreValueButtonFilter(coreValue: string) {
    const functionName = 'toggleCoreValueButtonFilter';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: Toggling core value button: ${coreValue}`);

    // const coreValueButton = this.coreValueButtonList.find(x => x.Name === coreValue);
    if (this.appliedFilters.find(x => x === coreValue)) {
      console.log(`${functionFullName}: Core value filter is already applied. Removing`);
      this.appliedFilters = this.appliedFilters.filter(x => x !== coreValue);
    } else {
      console.log(`${functionFullName}: Core value filter is not yet applied. Applying`);
      this.appliedFilters.push(coreValue);
    }

    this.filterPointItemList();
  }

  toggleCoreValueButton(coreValue: string) {
    const functionName = 'toggleCoreValueButton';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
    console.log(`${functionFullName}: Toggling core value button: ${coreValue}`);

    const coreValueButton = this.coreValueButtonList.find(x => x.Name === coreValue);
    if (coreValueButton.Toggled) {
      console.log(`${functionFullName}: Core value button is already toggled. Untoggling`);
      // coreValueButton.Toggled = false;
      document.getElementById(`button_${coreValue}`).className = document.getElementById(`button_${coreValue}`).className.replace('toggled', '').trim();
    } else {
      console.log(`${functionFullName}: Core value button is not yet toggled. Toggling`);
      // coreValueButton.Toggled = true;
      document.getElementById(`button_${coreValue}`).className = document.getElementById(`button_${coreValue}`).className += ' toggled';
    }

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

    const pointItemList: PointItemModel[] = this.pointItemQuery.getAll();
    this.filteredPointItemList = [];
    // const toggledCoreValues = this.coreValueButtonList.filter(x => x.Toggled);
    const toggledCoreValues = this.appliedFilters;
    if (toggledCoreValues.length === 0) {
      for (let i = 0; i < pointItemList.length; i++) {
        this.filteredPointItemList = [];
      }
    } else {
      for (let i = 0; i < pointItemList.length; i++) {
        // Only add point item to the filtered list if it contains ALL the toggled core values
        let noMatch = false;
        for (let j = 0; j < toggledCoreValues.length; j++) {
          console.log(`Checking if ${pointItemList[i].name} contains core value ${toggledCoreValues[j]}`);
          if (pointItemList[i].coreValues.find(x => x === toggledCoreValues[j])) {
            // filteredPointItem contains current toggled core value
            console.log(`${pointItemList[i].name} contains core value ${toggledCoreValues[j]}`);

          } else {
            // filteredPointItem does NOT contain current toggled core value. Break out of loop
            console.log(`${pointItemList[i].name} does NOT contain core value ${toggledCoreValues[j]}`);
            noMatch = true;
            break;
          }
        }

        if (!noMatch) {
          console.log(`Adding ${pointItemList[i].name} to the filtered list`);
          this.filteredPointItemList.push(pointItemList[i]);
        }
      }
    }

    if (this.selectedPointItem && !this.filteredPointItemList.find(x => x.itemId === this.selectedPointItem.itemId)) {
      console.log('filtered point item list does not contain the currently selected point item. Setting selected point item to null and untoggling all core values');
      this.selectedPointItem = null;
      this.untoggleAllCoreValueButtons();
    }
  }

  selectPointItem(pointItem: PointItemModel) {
    const functionName = 'selectPointItem';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(pointItem);
    this.selectedPointItem = pointItem;
    // this.setAllButtonsInactive();
    this.untoggleAllCoreValueButtons();

    for (let i = 0; i < pointItem.coreValues.length; i++) {
      console.log(`${functionFullName}: Toggling core value '${pointItem.coreValues[i]}' for point item '${pointItem.name}'`);
      this.toggleCoreValueButton(pointItem.coreValues[i]);
    }
  }

  resetForm(form: NgForm) {
    const functionName = 'resetForm';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    form.resetForm();
  }

  styleObject(user: EntityUserModel): Object {
    if (this.selection.isSelected(user)) {
      const boxShadow = 'rgb(81, 203, 238) 0px 0px 5px';
      const padding = '3px 0px 3px 3px';
      const margin = '5px 1px 3px 0px';
      const border = '1px solid rgb(81, 203, 238)';
      return {
        'box-shadow': boxShadow,
      'padding': padding,
      'margin': margin,
      'border': border,
      };
    }
    return {
/*      '-webkit-transition': 'all 0.30s ease-in-out',
    '-moz-transition': 'all 0.30s ease-in-out',
    '-ms-transition': 'all 0.30s ease-in-out',
    '-o-transition': 'all 0.30s ease-in-out',
    'outline': 'none',
    'padding': '3px 0px 3px 3px',
    'margin': '5px 1px 3px 0px',
    'border': '1px solid #DDDDDD',*/
    };
  }

  onAvatarClick(event, user) {
    // console.log(event);
    // console.log(user);
    console.log(event);
    this.clickedUser = user;
/*    $('#giftClickedModal').modal('show');
    console.log(document.getElementById('giftClickedModal'));*/
/*    if (!this.toggled) {
      this.selection.clear();
    }*/
    this.selection.toggle(user);
    this.selection.isSelected(user);

  }

  showMore() {
    this.showLimit = 100;
    this.showFlag = true;

  }

  showLess() {
    this.showLimit = 7;
    this.showFlag = false;
  }

  toggle() {
    this.showMore(); this.showLess();
  }
}
