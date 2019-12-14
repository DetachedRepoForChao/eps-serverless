import {Component, OnDestroy, OnInit} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { Globals} from '../../../globals';
import { DepartmentService} from '../../../shared/department.service';
import { UserService} from '../../../shared/user.service';
import {User} from '../../../shared/user.model';
import { Department} from '../../../shared/department.model';
import {MatDialog, MatTableDataSource, ThemePalette} from '@angular/material';

import {PointItem} from '../../../shared/point-item.model';
import {FormBuilder, FormControl, FormGroup, NgForm, ValidatorFn, Validators} from '@angular/forms';
import {componentRefresh} from '@angular/core/src/render3/instructions';
import {Router} from '@angular/router';
import {Observable, forkJoin, Subject, throwError} from 'rxjs';
import {NotifierService} from 'angular-notifier';
import {LeaderboardService} from '../../../shared/leaderboard.service';
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
import {catchError, take, takeUntil} from 'rxjs/operators';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {requireCheckboxesToBeCheckedValidator} from '../../admin-user/point-items-card/point-items-card.component';
import {StoreItemModel} from '../../../entity-store/store-item/state/store-item.model';
import {ConfirmationDialogComponent} from '../../components/shared/confirmation-dialog/confirmation-dialog.component';


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
export class GiftPointsComponent implements OnInit, OnDestroy {
  componentName = 'gift-points.component';
  private pointItemsLoading$ = new Subject<void>();
  private usersLoading$ = new Subject<void>();
  private currentUserLoading$ = new Subject<void>();
  private unsubscribe$ = new Subject<void>();

  public config: PerfectScrollbarConfigInterface = {};
  addPointItemForm: FormGroup;
  addPointItemFormSubmitted = false;
  editPointItemForm: FormGroup;
  editPointItemFormSubmitted = false;
  deletePointItemForm: FormGroup;
  deletePointItemFormSubmitted = false;
  departmentSelectionForm: FormGroup;
  departmentSelectionFormSubmitted = false;
  employeeSearchForm: FormGroup;
  pointSearchForm: FormGroup;

  displayedColumns: string[] = ['select', 'avatar', 'name', 'username', 'email', 'position', 'points'];
  // selection = new SelectionModel<DepartmentEmployee>(true, []);
  selection = new SelectionModel<EntityUserModel>(true, []);
  // dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList$: Observable<PointItemModel[]>;
  pointItems: PointItemModel[];
  filteredPointItemList: PointItemModel[] = [];
  // selectedPointItem = {};
  selectedEmployees = [];
  selectedCoreValues = [];
  coreValues: string[] = ['happy', 'fun', 'genuine', 'caring', 'respect', 'honest'];
  coreValueButtonList: CoreValueButton[] = [];
  selectedPointItem: PointItemModel;
  employees$: Observable<EntityUserModel[]>;
  employees: EntityUserModel[];
  currentUser: EntityCurrentUserModel;
  departments: Department[];
  isCardLoading: boolean;
  formSubmitted = false;
  showLimit = 7;
  showFlag = false;
  clickedUser;

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;
  toggled = false;

  appliedFilters = [];
  currentManagePointItemView = 'addPointItem';

  selectedAll = false;
  selectedDepartment: Department;

  constructor(private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              public dialog: MatDialog,
              private userService: UserService,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private router: Router,
              private achievementService: AchievementService,
              private notifierService: NotifierService,
              private leaderboardService: LeaderboardService,
              private spinner: NgxSpinnerService,
              private entityUserService: EntityUserService,
              private userStore: UserStore,
              private entityUserQuery: EntityUserQuery,
              private currentUserQuery: EntityCurrentUserQuery,
              private currentUserService: EntityCurrentUserService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: setting isCardLoading to true:`);
    this.isCardLoading = true;
    this.spinner.hide('gift-points-spinner');

    this.populateCoreValueButtonList();

    this.loadPointSearchForm();
    this.loadEmployeeSearchForm();
    this.loadDepartmentSelectionForm();

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;

              if (this.currentUser.awardManager === true) {
                this.loadAddPointItemForm();
                this.loadEditPointItemForm();
                this.loadDeletePointItemForm();

                // Subscribe to change events for the 'pointItem' field. Every time a new pointItem is selected, the corresponding fields will populate with data
                this.editPointItemForm.get('pointItem').valueChanges
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(pointItem => {
                    console.log(pointItem);
                    this.editPointItemForm.controls.coreValuesGroup.reset();

                    const keys = Object.keys(pointItem);
                    for (let i = 0; i < keys.length; i++) {
                      const key = keys[i];
                      console.log(key);
                      if (key === 'coreValues') {
                        for (let j = 0; j < pointItem.coreValues.length; j++) {
                          const formCoreValueKey = `coreValue_${pointItem.coreValues[j]}`;
                          this.editPointItemForm.controls.coreValuesGroup.patchValue({[formCoreValueKey]: true});
                        }
                      }
                      if (this.editPointItemForm.get(key)) {
                        this.editPointItemForm.patchValue({[key]: pointItem[keys[i]]});
                      }
                    }
                  });

                this.deletePointItemForm.get('pointItem').valueChanges
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe(pointItem => {
                    console.log(pointItem);

                    const keys = Object.keys(pointItem);
                    for (let i = 0; i < keys.length; i++) {
                      const key = keys[i];

                      if (this.deletePointItemForm.get(key)) {
                        this.deletePointItemForm.patchValue({[key]: pointItem[keys[i]]});
                      }
                    }
                  });
              }
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    this.pointItemQuery.selectLoading()
      .pipe(takeUntil(this.pointItemsLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.pointItemQuery.selectAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((pointItems: PointItemModel[]) => {
              this.pointItems = pointItems;
            });

          this.pointItemsLoading$.next();
          this.pointItemsLoading$.complete();
        }
      });

    this.entityUserQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.entityUserQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1,
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.employees = users;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    // Read in the list of departments from the DepartmentService
    this.departmentService.getDepartments()
      .pipe(
        take(1),
        catchError(err => {
          console.log('Error...', err);
          return throwError(err);
        })
      )
      .subscribe((departments: Department[]) => {
          this.departments = departments;

        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Completed.');
        }
      );

    // When a department is selected, toggle all employees belonging to that department
    this.departmentSelectionForm.get('departmentSelection').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((department: Department) => {
        console.log(department);
        this.selection.clear();

        this.selectedDepartment = department;
        const departmentUsers = this.employees.filter(x => x.department.Id === department.Id);

        for (const departmentUser of departmentUsers) {
          this.selection.toggle(departmentUser);
        }

      });

    this.isCardLoading = false;
    this.spinner.hide('gift-points-spinner');

    // this.showLimit = 7;
  }

  private loadAddPointItemForm() {
    this.addPointItemForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null],
      amount: [null, Validators.required],
      coreValuesGroup: new FormGroup({
        coreValue_happy: new FormControl(false),
        coreValue_fun: new FormControl(false),
        coreValue_genuine: new FormControl(false),
        coreValue_caring: new FormControl(false),
        coreValue_respect: new FormControl(false),
        coreValue_honest: new FormControl(false),
      }, requireCheckboxesToBeCheckedValidator(1))
    });
  }

  private loadEditPointItemForm() {
    this.editPointItemForm = this.formBuilder.group({
      pointItem: [null, Validators.required],
      name: [null, Validators.required],
      description: [null],
      amount: [null, Validators.required],
      coreValuesGroup: new FormGroup({
        coreValue_happy: new FormControl(false),
        coreValue_fun: new FormControl(false),
        coreValue_genuine: new FormControl(false),
        coreValue_caring: new FormControl(false),
        coreValue_respect: new FormControl(false),
        coreValue_honest: new FormControl(false),
      }, requireCheckboxesToBeCheckedValidator(1))
    });
  }


  private loadDeletePointItemForm() {
    this.deletePointItemForm = this.formBuilder.group({
      pointItem: [null, Validators.required],
    });
  }

  private loadDepartmentSelectionForm() {
    this.departmentSelectionForm = this.formBuilder.group({
      departmentSelection: [null],
    });
  }

  private loadEmployeeSearchForm() {
    this.employeeSearchForm = this.formBuilder.group({
      employeeSearch: [null],
    });
  }

  private loadPointSearchForm() {
    this.pointSearchForm = this.formBuilder.group({
      pointSearch: [null],
    });
  }

  onAddPointItemFormSubmit(form: FormGroup) {
    console.log(form);
    this.addPointItemFormSubmitted = true;
    const pointItem = {};
    let coreValues = [];
    const keys = Object.keys(form.controls);

    // Proceed only if the form is valid
    if (!form.invalid) {
      /*
      Iterate over the form field keys and add the key/value pair to the pointItem object we'll be passing
      to the modifyPointItem function.
      */
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'coreValuesGroup') {
          // Special consideration for the Core Values field
          const formCoreValuesGroup = form.controls[keys[i]].value;
          const formCoreValueKeys = Object.keys(formCoreValuesGroup);

          // Loop the Core Values and add them to the newCoreValues array if they are selected
          for (let j = 0; j < formCoreValueKeys.length; j++) {
            const formCoreValueKey = formCoreValueKeys[j];
            const coreValue = formCoreValueKey.split('_')[1];
            const coreValueStatus = formCoreValuesGroup[formCoreValueKey];

            if (coreValueStatus === true) {
              coreValues.push(coreValue);
            }
          }

          coreValues = coreValues.sort();
          pointItem['coreValues'] = coreValues;

        } else {
          pointItem[keys[i]] = form.controls[keys[i]].value;
        }
      }

      pointItem['createdByUsername'] = this.currentUser.username;
      pointItem['updatedByUsername'] = this.currentUser.username;

      this.pointItemService.newPointItem(pointItem).subscribe(addResult => {
        console.log(addResult);
        if (addResult.status !== false) {
          this.notifierService.notify('success', 'Point item record added successfully.');
          this.addPointItemFormSubmitted = false;
        } else {
          this.notifierService.notify('error', `Submission error: ${addResult.message}`);
        }
      });

      console.log(pointItem);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }


  onEditPointItemFormSubmit(form: FormGroup) {
    console.log(form);
    this.editPointItemFormSubmitted = true;
    const sourcePointItem = form.controls.pointItem.value;
    const pointItem = {};
    let newCoreValues = [];
    const oldCoreValues = sourcePointItem['coreValues'].slice(0).sort();
    const keys = Object.keys(form.controls);

    // Proceed only if the form is valid
    if (!form.invalid) {
      /*
      Iterate over the form field keys and add the key/value pair to the pointItem object we'll be passing
      to the modifyPointItem function.
      */
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'coreValuesGroup') {
          // Special consideration for the Core Values field
          const formCoreValuesGroup = form.controls[keys[i]].value;
          const formCoreValueKeys = Object.keys(formCoreValuesGroup);

          // Loop the Core Values and add them to the newCoreValues array if they are selected
          for (let j = 0; j < formCoreValueKeys.length; j++) {
            const formCoreValueKey = formCoreValueKeys[j];
            const coreValue = formCoreValueKey.split('_')[1];
            const coreValueStatus = formCoreValuesGroup[formCoreValueKey];

            if (coreValueStatus === true) {
              newCoreValues.push(coreValue);
            }
          }

          // We're going to detect Core Value changes by comparing the sorted new and old Core Value arrays
          newCoreValues = newCoreValues.sort();

          // If the arrays are at all different, we add the new Core Values object to the pointItem object
          if (newCoreValues.length !== oldCoreValues.length) {
            console.log('There were core value changes because the arrays are not the same size.');
            pointItem['coreValues'] = newCoreValues;
          } else {
            for (let j = 0; j < newCoreValues.length; j++) {
              if (newCoreValues[j] !== oldCoreValues[j]) {
                console.log('Core values changed');
                pointItem['coreValues'] = newCoreValues;
              }
            }
          }
        } else if (keys[i] !== 'pointItem') { // Disregard the source point item form control object
          if (sourcePointItem[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // If the value has changed, add key/value pair to the pointItem object
            console.log('Value changed:');
            console.log(form.controls[keys[i]].value);
            pointItem[keys[i]] = form.controls[keys[i]].value;
          }
        }
      }

      if (Object.keys(pointItem).length > 0) {
        // Point Item object changes exist. Add the itemId to the pointItem object and invoke modifyPointItem function

        pointItem['updatedByUsername'] = this.currentUser.username;
        pointItem['itemId'] = sourcePointItem.itemId;

        this.pointItemService.modifyPointItem(pointItem).subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.notifierService.notify('success', 'Point item record updated successfully.');
            this.editPointItemFormSubmitted = false;
          } else {
            this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
          }
        });
      } else {
        // Point Item object was not changed
        console.log('There are no changes to the point item object');
        this.notifierService.notify('warning', 'There were no changes made.');
        this.editPointItemFormSubmitted = false;
      }

      console.log(pointItem);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }


  onDeletePointItemFormSubmit(form: FormGroup) {
    console.log(form);
    this.deletePointItemFormSubmitted = true;
    let pointItem = {};

    if (!form.invalid) {
      pointItem = form.controls.pointItem.value;
      this.pointItemService.deletePointItem(pointItem).subscribe(deleteResult => {
        console.log(deleteResult);
        if (deleteResult.status !== false) {
          this.notifierService.notify('success', 'Point item record deleted successfully.');
          this.deletePointItemFormSubmitted = false;
        } else {
          this.notifierService.notify('error', `Submission error: ${deleteResult.message}`);
        }
      });
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
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

  onAwardPointsClick() {

  }

  openDialog(currentUser: EntityCurrentUserModel, selectedPointItem: PointItemModel, selectedEmployees: EntityUserModel[],
             selectedDepartment?: Department, selectedAll?: boolean): void {
    console.log(`confirm approval?`);

    if (!selectedPointItem && (!selectedEmployees || selectedEmployees.length === 0)) {
      this.notifierService.notify('warning', 'Please select a 🍍 Award and its recipient(s)!');
      return;
    } else if (!selectedPointItem) {
      this.notifierService.notify('warning', 'Please select a 🍍 Award');
      return;
    } else if (!selectedEmployees || selectedEmployees.length === 0) {
      this.notifierService.notify('warning', 'Please select recipient(s) for the 🍍 Award');
      return;
    }

    // Check to see if there was a department selected, and if it has but the selected employees have been
    // modified, clear out the selected department
    if (selectedDepartment) {
      const departmentEmployees = this.employees.filter(x => x.department.Id === selectedDepartment.Id);
      if (selectedEmployees.length !== departmentEmployees.length) {
        console.log(`Selected Employees and Department Employees lists are different lengths`);
        this.selectedDepartment = null;
        selectedDepartment = null;
      } else {
        for (const selectedEmployee of selectedEmployees) {
          if (departmentEmployees.indexOf(selectedEmployee) === -1) {
            console.log(`${selectedEmployee.username} is not in ${selectedDepartment.Name} department`);
            this.selectedDepartment = null;
            selectedDepartment = null;
            break;
          }
        }
      }
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: 600,
      data: {
        action: 'confirmAwardPoints',
        selectedPointItem: selectedPointItem,
        selectedEmployees: selectedEmployees,
        selectedDepartment: selectedDepartment,
        selectedAll: selectedAll,
      }
    });

    // width: '600px',
    // data: "Would you like to save your changes?",

    dialogRef.backdropClick().subscribe(() => {
      // Close the dialog
      dialogRef.close('Cancel');
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        console.log(`Dialog closed:`, result);
        if (result.action && result.action === 'Confirm') {
          this.pointItemOnSubmit(currentUser, selectedPointItem, selectedEmployees, result.comment, selectedDepartment, selectedAll);
        } else if (result === 'Cancel') {
          console.log('Cancelled');
        }
      });
  }

  pointItemOnSubmit(currentUser: EntityCurrentUserModel, selectedPointItem: PointItemModel, selectedEmployees: EntityUserModel[], comment: string,
                    selectedDepartment?: Department, selectedAll?: boolean) {
    const functionName = 'pointItemOnSubmit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: this.selectedPointItem:`);
    // console.log(this.selectedPointItem);

    // console.log(`${functionFullName}: this.selection.selected:`);
    // console.log(this.selection.selected);

    // const sourceUser = currentUser;

    // Create an object array to send to the backend API in one bulk operation
    const userPointObjectArray = [];
    // const totalAmount = selectedPointItem.amount * selectedEmployees.length;
    // let totalAmount = 0; // Used to figure out the total amount of points that will be removed from the point pool
    for (const selectedEmployee of selectedEmployees) {
      console.log('gifting points to: ' + selectedEmployee.username);
      // totalAmount = totalAmount + selectedPointItem.amount;

      const userPointObject = {
        userId: selectedEmployee.userId,
        pointItemName: this.selectedPointItem.name,
        pointItemId: this.selectedPointItem.itemId,
        amount: this.selectedPointItem.amount,
        coreValues: this.selectedPointItem.coreValues,
        description: comment,
      };

      userPointObjectArray.push(userPointObject);
    }

    this.pointItemService.awardPointsToEmployees(userPointObjectArray)
      .pipe(take(1))
      .subscribe(
        (giftPointsResult: any) => {
          console.log('giftPointsResult');
          console.log(giftPointsResult);
          const newPointPoolAmount = giftPointsResult.newPointPoolAmount;
          const resultObjectArray = giftPointsResult.resultObjectArray;
          this.currentUserService.updatePointPool(+newPointPoolAmount);
          this.notifierService.notify('success', 'Awards successful!');

          for (const resultObject of resultObjectArray) {
            // If the backend function call returned true, update points for user and send them an email notification
            if (resultObject.status === true) {
              const targetUser = selectedEmployees.filter(x => x.userId === resultObject.targetUserId)[0];
              this.entityUserService.updatePoints(+resultObject.targetUserId, +resultObject.newPointAmount);
              this.pointItemService.sendAwardPointsNotice(targetUser, currentUser, selectedPointItem, comment)
                .pipe(take(1))
                .subscribe(emailResult => {
                  console.log(`${functionFullName}: email result`);
                  console.log(emailResult);
                });
            }

          }

          this.achievementService.incrementAchievementByX('AwardPoint', resultObjectArray.length)
            .pipe(take(1))
            .subscribe();   // TODO Earned achievement notification
          this.selection.clear();
        },
        (err) => {
          console.log(`${functionFullName}: award points threw an error`, err);
          this.notifierService.notify('error', 'Error awarding points!');   // TODO Send error log to administrator?
        });

/*    if (!this.selectedPointItem || (this.selection.selected.length === 0)) {
    } else {


/!*      // Check if the manager has enough points in his points pool to complete the transaction
      const currentPointsPool = sourceUser.pointsPool;
      if (totalAmount > currentPointsPool) {
        console.log('Not enough points in the points pool to complete transaction. Stopping...');
        this.notifierService.notify('error', 'Not enough points in your Points Pool!');
        this.selection.clear();
      } else {
        console.log('Sufficient points in the points pool to complete the transaction. Continuing...');
        console.log(userPointObjectArray);

      }*!/
    }*/

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

  isCoreValueSelected(coreValue: string) {
    return !!(this.appliedFilters.find(x => x === coreValue));
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

    this.filteredPointItemList = [];

    this.pointItemQuery.selectLoading()
      .pipe(takeUntil(this.pointItemsLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.pointItemQuery.selectAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((pointItems: PointItemModel[]) => {
              const pointItemList: PointItemModel[] = pointItems;

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
                    // console.log(`Checking if ${pointItemList[i].name} contains core value ${toggledCoreValues[j]}`);
                    if (pointItemList[i].coreValues.find(x => x === toggledCoreValues[j])) {
                      // filteredPointItem contains current toggled core value
                      // console.log(`${pointItemList[i].name} contains core value ${toggledCoreValues[j]}`);

                    } else {
                      // filteredPointItem does NOT contain current toggled core value. Break out of loop
                      // console.log(`${pointItemList[i].name} does NOT contain core value ${toggledCoreValues[j]}`);
                      noMatch = true;
                      break;
                    }
                  }

                  if (!noMatch) {
                    // console.log(`Adding ${pointItemList[i].name} to the filtered list`);
                    this.filteredPointItemList.push(pointItemList[i]);
                  }
                }
              }

              if (this.selectedPointItem && !this.filteredPointItemList.find(x => x.itemId === this.selectedPointItem.itemId)) {
                // console.log('filtered point item list does not contain the currently selected point item. Setting selected point item to null and untoggling all core values');
                this.selectedPointItem = null;
                this.untoggleAllCoreValueButtons();
              }
            });

          this.pointItemsLoading$.next();
          this.pointItemsLoading$.complete();
        }
      });
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
      // console.log(`${functionFullName}: Toggling core value '${pointItem.coreValues[i]}' for point item '${pointItem.name}'`);
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

  onManagePointItemTabItemClick(clickedItem: string) {
    if (this.currentManagePointItemView === clickedItem) {
      // Already there, do nothing.
    } else {
      this.currentManagePointItemView = clickedItem;
    }
  }

  selectAll() {
    this.selectedDepartment = null;
    this.selectedAll = true;
    this.selection.clear();
    for (const employee of this.employees) {
      this.selection.toggle(employee);
    }
  }

  clearSelection() {
    this.selectedDepartment = null;
    this.selectedAll = false;
    this.selection.clear();
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.pointItemsLoading$.next();
    this.pointItemsLoading$.complete();
    this.usersLoading$.next();
    this.usersLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
