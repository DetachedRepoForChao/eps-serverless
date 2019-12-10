import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../../globals';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {AuthService} from '../../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {take, takeUntil, tap} from 'rxjs/operators';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {forkJoin, Observable, Subject} from 'rxjs';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../../environments/environment';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {requireCheckboxesToBeCheckedValidator} from '../point-items-card/point-items-card.component';

export function managerValidation(pointPoolMax): ValidatorFn {
  return function validate(formGroup: FormGroup) {
    const securityRoleId = (formGroup.controls.securityRole && formGroup.controls.securityRole.value) ? formGroup.controls.securityRole.value.Id : null;
    if (securityRoleId === 2) {
      const pointPoolControl = formGroup.controls['pointsPool'];
      console.log(pointPoolControl);
      if (!pointPoolControl.value || pointPoolControl.value < 0 || pointPoolControl.value > pointPoolMax) {
        return {
          pointPoolValidation: true
        };
      } else {
      }

    }
    return null;
  };
}

@Component({
  selector: 'app-users-card',
  templateUrl: './users-card.component.html',
  styleUrls: ['./users-card.component.css']
})
export class UsersCardComponent implements OnInit, OnDestroy {
  componentName = 'users-card.component';
  public config: PerfectScrollbarConfigInterface = {};
  private unsubscribe$ = new Subject();
  private usersLoading$ = new Subject();

  zipPattern = new RegExp(/^\d{5}(?:\d{2})?$/);
  phoneValidationError: string;
  addUserForm: FormGroup;
  addUserFormSubmitted = false;
  editUserForm: FormGroup;
  editUserFormSubmitted = false;
  deleteUserForm: FormGroup;
  deleteUserFormSubmitted = false;
  activateUserForm: FormGroup;
  activateUserFormSubmitted = false;
  today = new Date(Date.now());
  departments: Department[];
  securityRoles: SecurityRole[];
  users: EntityUserModel[];
  deactivatedUsers: EntityUserModel[];
  public pointPoolMax: number;


  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private userService: EntityUserService,
              public userQuery: EntityUserQuery,
              private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              private securityRoleService: SecurityRoleService,
              private notifierService: NotifierService) { }

  ngOnInit() {
    // this.userService.cacheUsers().subscribe();
    // Read in the list of departments from the DepartmentService
    this.departmentService.getDepartments()
      .pipe(take(1))
      .subscribe((departments: Department[]) => {
        this.departments = departments;
      });

    this.securityRoleService.getSecurityRoles()
      .pipe(take(1))
      .subscribe((securityRoles: SecurityRole[]) => {
        this.securityRoles = securityRoles;
      });

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.users = users;
            });

          this.userQuery.selectDeactivatedUsers()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((deactivatedUsers: EntityUserModel[]) => {
              this.deactivatedUsers = deactivatedUsers;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    this.userService.getPointPoolMax()
      .pipe(take(1))
      .subscribe(pointPoolMax => {
        console.log(pointPoolMax);
        this.pointPoolMax = pointPoolMax;
        this.loadAddUserForm();
      });

    // load reactive forms
    this.loadEditUserForm();

    this.loadDeleteUserForm();
    this.loadActivateUserForm();

    // Subscribe to change events for the 'user' field. Every time a new user is selected, the corresponding fields will populate with data
    this.editUserForm.get('user').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        console.log(user);

        const keys = Object.keys(user);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];

          if (this.editUserForm.get(key) || this.editUserForm.controls.roleGroup.get(key)) {
            // We must take special consideration for selection objects like securityRole and department
            switch (key) {
              case 'securityRole': {
                const securityRole = this.securityRoles.find(x => x.Id === user[keys[i]].Id);
                // this.editUserForm.patchValue({[key]: securityRole});
                console.log(this.editUserForm.controls.roleGroup.get(key));
                this.editUserForm.controls.roleGroup.patchValue({[key]: securityRole});
                break;
              }
              case 'pointsPool': {
                // const securityRole = this.securityRoles.find(x => x.Id === user[keys[i]].Id);
                // this.editUserForm.patchValue({[key]: securityRole});
                console.log(this.editUserForm.controls.roleGroup.get(key));
                this.editUserForm.controls.roleGroup.patchValue({[key]: user[keys[i]]});
                break;
              }
              case 'department': {
                const department = this.departments.find(x => x.Id === user[keys[i]].Id);
                this.editUserForm.patchValue({[key]: department});
                break;
              }
              case 'birthdate': {
                const birthdate = (user[keys[i]]) ? this.fudgeDate(user[keys[i]]) : null;

                this.editUserForm.patchValue({[key]: birthdate});
                break;
              }
              case 'dateOfHire': {
                const dateOfHire = (user[keys[i]]) ? this.fudgeDate(user[keys[i]]) : null;

                this.editUserForm.patchValue({[key]: dateOfHire});
                break;
              }
              default: {
                this.editUserForm.patchValue({[key]: user[keys[i]]});
              }
            }
          }
        }
      });
  }

  // This is used to make Angular display the date correctly instead of being 1 day off due to
  // the way time zones work...
  fudgeDate(date): Date {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(new Date(date).getTime() + offset);
  }

  public trackByFunction(index, item) {
    if (!item) {
      return null;
    }
    return item.userId;
  }

  // Creates the Edit User reactive form
  private loadEditUserForm() {
    this.editUserForm = this.formBuilder.group({
      user: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      preferredName: [null],
      // prefix: [null],
      // suffix: [null],
      position: [null],
      // preferredPronoun: [null],
      // sex: [null],
      gender: [null],
      // The below FormGroup validation allows us to validate the form depending on whether the user being added is a manager or not
      roleGroup: new FormGroup({
        securityRole: new FormControl(),
        pointsPool: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(this.pointPoolMax)]),
      }, managerValidation(this.pointPoolMax)),
      department: [null, Validators.required],
      dateOfHire: [null],
      // address1: [null],
      // address2: [null],
      // city: [null],
      // state: [null],
      // country: [null],
      // zip: [null, Validators.compose([Validators.pattern(this.zipPattern)])],
      birthdate: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required],
      points: [null, Validators.compose([Validators.required, Validators.min(0)])],
    });
  }

  private loadAddUserForm() {
    this.addUserForm = this.formBuilder.group({
      username: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      preferredName: [null],
      // prefix: [null],
      // suffix: [null],
      position: [null],
      // preferredPronoun: [null],
      // sex: [null],
      gender: [null],

      // The below FormGroup validation allows us to validate the form depending on whether the user being added is a manager or not
      roleGroup: new FormGroup({
        securityRole: new FormControl(),
        pointsPool: new FormControl(this.pointPoolMax, [Validators.required, Validators.min(0), Validators.max(this.pointPoolMax)]),
      }, managerValidation(this.pointPoolMax)),

      department: [null, Validators.required],
      dateOfHire: [null],
      // address1: [null],
      // address2: [null],
      // city: [null],
      // state: [null],
      // country: [null],
      // zip: [null, Validators.compose([Validators.pattern(this.zipPattern)])],
      birthdate: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required],
      points: [null, Validators.compose([Validators.required, Validators.min(0)])],

    });
  }

  private loadDeleteUserForm() {
    this.deleteUserForm = this.formBuilder.group({
      user: [null, Validators.required],
    });
  }

  private loadActivateUserForm() {
    this.activateUserForm = this.formBuilder.group({
      user: [null, Validators.required],
    });
  }

// Validates and formats the phone number by stripping out anything except number characters
  validatePhoneNumber(phone: string): (string | null) {
    console.log(phone);
    this.phoneValidationError = null;
    // Strip out all characters except numbers
    const newVal = phone.replace(/\D+/g, '');
    console.log (newVal);
    if (newVal.length === 10) {
      return newVal;
    } else {
      console.log(`Phone validation error. Phone length: ${newVal.length}`);
      this.phoneValidationError = 'The phone number must be 10 digits long.';
      return null;
    }
  }

  logDate(event) {
    console.log(event);
  }

  onEditUserFormSubmit(form: FormGroup) {
    console.log(form);
    console.log(form.controls.birthdate.value);
    console.log(new Date(form.controls.birthdate.value));
    console.log(form.controls.user.value.birthdate);
    console.log(new Date(form.controls.user.value.birthdate));
    this.editUserFormSubmitted = true;

    const sourceUser = form.controls.user.value;
    const user = {};
    const keys = Object.keys(form.controls);

    // Proceed only if the form is valid
    if (!form.invalid) {
      // Format the phone number
      const phone = `+1${this.validatePhoneNumber(form.controls.phone.value)}`;
      // form.controls.phone.setValue(phone);

      /*
      Iterate over the form field keys and add the key/value pair to the user object we'll be passing
      to the modifyUser function. Any fields that were removed will be replaced with the *REMOVE* string
      this will let our function know that those fields should be cleared.
      */
      for (let i = 0; i < keys.length; i++) {
        if ((keys[i] === 'securityRole') || (keys[i] === 'department')) {
          console.log(keys[i]);
          // Special consideration for nested objects like securityRole and department
          if (sourceUser[keys[i]].Id === form.controls[keys[i]].value.Id) {
            // No change
          } else {
            console.log('Value changed:');
            console.log(form.controls[keys[i]].value);
            switch (keys[i]) { // we need to account for securityRole and department objects
              case 'securityRole': {
                user['securityRoleId'] = form.controls[keys[i]].value.Id;
                user['securityRoleName'] = form.controls[keys[i]].value.Name;
                break;
              }
              case 'department': {
                user['departmentId'] = form.controls[keys[i]].value.Id;
                user['departmentName'] = form.controls[keys[i]].value.Name;
                break;
              }
            }
          }
        } else if ((keys[i] === 'birthdate') || (keys[i] === 'dateOfHire')) {
          const date = new Date(form.controls[keys[i]].value);
          const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            console.log('Date value changed:');
            console.log(`Old value: ${sourceUser[keys[i]]}; New value: ${dateString}`);

            user[keys[i]] = dateString;
          }
        } else if (keys[i] !== 'user') {
          if (sourceUser[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // If the value has changed, add key/value pair to the user object
            console.log('Value changed:');
            console.log(form.controls[keys[i]].value);

            switch (keys[i]) {
              case 'phone': { // special case for phone
                user[keys[i]] = phone;
                break;
              }
              default: {
                user[keys[i]] = form.controls[keys[i]].value;
                break;
              }
            }
          }
        }
      }

      if (Object.keys(user).length > 0) {
        // User object changes exist. Add the userId to the user object and invoke modifyUser function
        user['userId'] = sourceUser.userId;
        user['username'] = sourceUser.username;
        this.userService.modifyUser(user)
          .pipe(take(1))
          .subscribe(modifyResult => {
            console.log(modifyResult);
            if (modifyResult.status !== false) {
              this.notifierService.notify('success', 'User record updated successfully.');
              this.editUserFormSubmitted = false;
            } else {
              this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
            }
          });

      } else {
        // User object was not changed
        console.log('There are no changes to the user object');
        this.notifierService.notify('warning', 'There were no changes made.');
        this.editUserFormSubmitted = false;
      }

      console.log(user);
      // form.controls.user.reset();
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onEditUserFormClose(form) {
    // form.controls.user.reset();
  }

  getAge(date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  onAddUserFormSubmit(form: FormGroup) {
    console.log(form);
    return;
    this.addUserFormSubmitted = true;

    const user = {};
    const keys = Object.keys(form.controls);

    console.log(user);


    if (!form.invalid) {
      // Format the phone number
      const phone = `+1${this.validatePhoneNumber(form.controls.phone.value)}`;

      // /!*
      // Iterate over the form field keys and add the key/value pair to the user object we'll be passing
      // to the addUser function.
      // *!/
      for (let i = 0; i < keys.length; i++) {
        if ((keys[i] === 'securityRole') || (keys[i] === 'department')) {
          console.log(keys[i]);
          // Special consideration for nested objects like securityRole and department
          switch (keys[i]) { // we need to account for securityRole and department objects
            case 'securityRole': {
              user['securityRoleId'] = form.controls[keys[i]].value.Id;
              user['securityRoleName'] = form.controls[keys[i]].value.Name;
              break;
            }
            case 'department': {
              user['departmentId'] = form.controls[keys[i]].value.Id;
              user['departmentName'] = form.controls[keys[i]].value.Name;
              break;
            }
          }
        } else if ((keys[i] === 'birthdate') || (keys[i] === 'dateOfHire')) {
          const date = new Date(form.controls[keys[i]].value);
          const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          user[keys[i]] = dateString;
        } else {
          switch (keys[i]) {
            case 'phone': { // special case for phone
              user[keys[i]] = phone;
              break;
            }
            default: {
              user[keys[i]] = form.controls[keys[i]].value;
              break;
            }
          }
        }
      }

      this.userService.addUser(user)
        .pipe(take(1))
        .subscribe(addResult => {
          console.log(addResult);
          if (addResult.status !== false) {
            this.notifierService.notify('success', 'User record added successfully.');
            this.addUserFormSubmitted = false;
          } else {
            this.notifierService.notify('error', `Submission error: ${addResult.message}`);
          }
        });

      console.log(user);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }


  onDeleteUserFormSubmit(form: FormGroup) {
    console.log(form);
    this.deleteUserFormSubmitted = true;

    let user = {};

    console.log(user);

    if (!form.invalid) {
      user = form.controls.user.value;
      this.userService.deleteUser(user)
        .pipe(take(1))
        .subscribe(deleteResult => {
          console.log(deleteResult);
          if (deleteResult.status !== false) {
            this.notifierService.notify('success', 'User record deleted successfully.');
            this.deleteUserFormSubmitted = false;
          } else {
            this.notifierService.notify('error', `Submission error: ${deleteResult.message}`);
          }
        });

      console.log(user);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onDeactivateUserFormSubmit(form: FormGroup) {
    console.log(form);
    this.deleteUserFormSubmitted = true;

    let user = {};

    console.log(user);

    if (!form.invalid) {
      user = form.controls.user.value;
      this.userService.deactivateUser(user)
        .pipe(take(1))
        .subscribe(deactivateResult => {
          console.log(deactivateResult);
          if (deactivateResult.status !== false) {
            this.notifierService.notify('success', 'User record deactivated successfully.');
            this.deleteUserFormSubmitted = false;
            form.reset();
          } else {
            this.notifierService.notify('error', `Submission error: ${deactivateResult.message}`);
          }
        });

      console.log(user);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onActivateUserFormSubmit(form: FormGroup) {
    console.log(form);
    this.activateUserFormSubmitted = true;

    let user = {};

    console.log(user);

    if (!form.invalid) {
      user = form.controls.user.value;
      this.userService.activateUser(user)
        .pipe(take(1))
        .subscribe(activateResult => {
          console.log(activateResult);
          if (activateResult.status !== false) {
            this.notifierService.notify('success', 'User record activated successfully.');
            this.activateUserFormSubmitted = false;
            form.reset();
          } else {
            this.notifierService.notify('error', `Submission error: ${activateResult.message}`);
          }
        });

      console.log(user);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.usersLoading$.next();
    this.usersLoading$.complete();
  }
}
