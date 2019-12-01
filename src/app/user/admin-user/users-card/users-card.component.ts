import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../../globals';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {AuthService} from '../../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {forkJoin, Observable} from 'rxjs';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-users-card',
  templateUrl: './users-card.component.html',
  styleUrls: ['./users-card.component.css']
})
export class UsersCardComponent implements OnInit {
  componentName = 'users-card.component';
  public config: PerfectScrollbarConfigInterface = {};
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
  departments;
  securityRoles;

  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              private securityRoleService: SecurityRoleService,
              private notifierService: NotifierService) { }

  ngOnInit() {
    this.userService.cacheUsers().subscribe();
    // Read in the list of departments from the DepartmentService
    const departments$ = this.departmentService.getDepartments()
      .pipe(
        tap((departments: Department[]) => {
          this.departments = departments;
        })
      );

    // Read in the list of security roles from the SecurityRole service
    const securityRoles$ = this.securityRoleService.getSecurityRoles()
      .pipe(
        tap((securityRoles: SecurityRole[]) => {
          this.securityRoles = securityRoles;
        })
      );

    const observables: Observable<any>[] = [];
    observables.push(departments$);
    observables.push(securityRoles$);

    forkJoin(observables)
      .subscribe(() => {
      });

    // load reactive forms
    this.loadEditUserForm();
    this.loadAddUserForm();
    this.loadDeleteUserForm();
    this.loadActivateUserForm();
    // Subscribe to change events for the 'user' field. Every time a new user is selected, the corresponding fields will populate with data
    this.editUserForm.get('user').valueChanges.subscribe(user => {
      console.log(user);

      const keys = Object.keys(user);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (this.editUserForm.get(key)) {
          // We must take special consideration for selection objects like securityRole and department
          switch (key) {
            case 'securityRole': {
              const securityRole = this.securityRoles.find(x => x.Id === user[keys[i]].Id);
              this.editUserForm.patchValue({[key]: securityRole});
              break;
            }
            case 'department': {
              const department = this.departments.find(x => x.Id === user[keys[i]].Id);
              this.editUserForm.patchValue({[key]: department});
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

  // Creates the Edit User reactive form
  private loadEditUserForm() {
    this.editUserForm = this.formBuilder.group({
      user: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      preferredName: [null],
      prefix: [null],
      suffix: [null],
      position: [null],
      preferredPronoun: [null],
      sex: [null],
      gender: [null],
      securityRole: [null, Validators.required],
      department: [null, Validators.required],
      dateOfHire: [null],
      address1: [null],
      address2: [null],
      city: [null],
      state: [null],
      country: [null],
      zip: [null, Validators.compose([Validators.pattern(this.zipPattern)])],
      birthdate: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required]
    });
  }

  private loadAddUserForm() {
    this.addUserForm = this.formBuilder.group({
      username: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      preferredName: [null],
      prefix: [null],
      suffix: [null],
      position: [null],
      preferredPronoun: [null],
      sex: [null],
      gender: [null],
      securityRole: [null, Validators.required],
      department: [null, Validators.required],
      dateOfHire: [null],
      address1: [null],
      address2: [null],
      city: [null],
      state: [null],
      country: [null],
      zip: [null, Validators.compose([Validators.pattern(this.zipPattern)])],
      birthdate: [null, Validators.required],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required]
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

  onEditUserFormSubmit(form: FormGroup) {
    console.log(form);
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
        this.userService.modifyUser(user).subscribe(modifyResult => {
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

  onAddUserFormSubmit(form: FormGroup) {
    console.log(form);
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

      this.userService.addUser(user).subscribe(addResult => {
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
      this.userService.deleteUser(user).subscribe(deleteResult => {
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
      this.userService.deactivateUser(user).subscribe(deactivateResult => {
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
      this.userService.activateUser(user).subscribe(activateResult => {
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
}
