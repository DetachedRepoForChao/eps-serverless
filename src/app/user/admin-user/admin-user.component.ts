import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import {AchievementComponent} from '../../shared/achievement/achievement.component';
import {AchievementService} from '../../shared/achievement/achievement.service';
import {AuthService} from '../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {Department} from '../../shared/department.model';
import {SecurityRole} from '../../shared/securityrole.model';
import {forkJoin, Observable} from 'rxjs';
import {DepartmentService} from '../../shared/department.service';
import {SecurityRoleService} from '../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../environments/environment';

declare var $: any;

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  componentName = 'admin-user.component';
  public config: PerfectScrollbarConfigInterface = {};
  zipPattern = new RegExp(/^\d{5}(?:\d{2})?$/);
  phoneValidationError: string;
  addUserForm: FormGroup;
  editUserForm: FormGroup;
  deleteUserForm: FormGroup;
  selectUserForm: FormGroup;
  deletepointForm: FormGroup;
  selectedUser;
  removeFieldArray = [];
  departments;
  securityRoles;
  selectedDepartment;
  selectedSecurityRole;

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

    // Build the reactive Edit User form
    this.loadEditUserForm();

    this.loadAddUserForm();

    // Subscribe to change events for the 'user' field. Everytime a new user is selected, the correpsonding fields will populate with data
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

    // Load the DatePicker for the birthdate field
    $('#editUser_birthdate').datetimepicker({
      format: 'L',
      viewMode: 'years',
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-chevron-up",
        down: "fa fa-chevron-down",
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
      }
    });

    // Load the DatePicker for the dateOfHire field
    $('#editUser_dateOfHire').datetimepicker({
      format: 'L',
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-chevron-up",
        down: "fa fa-chevron-down",
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
      }
    });

    $('#addUser_birthdate').datetimepicker({
      format: 'L',
      viewMode: 'years',
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-chevron-up",
        down: "fa fa-chevron-down",
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
      }
    });

    // Load the DatePicker for the dateOfHire field
    $('#addUser_dateOfHire').datetimepicker({
      format: 'L',
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-chevron-up",
        down: "fa fa-chevron-down",
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
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
      birthdate: [null],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required]
    });
  }

  private loadAddUserForm() {
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
      birthdate: [null],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: [null, Validators.required]
    });
  }

/*  toggleRemoveField(field: string) {
    if (document.getElementById(`editUser_${field}`).attributes.getNamedItem('disabled')) {
      // Remove disabled tag from field
      document.getElementById(`editUser_${field}`).attributes.removeNamedItem('disabled');

      // Remove field from the removeFieldArray
      const index: number = this.removeFieldArray.indexOf(field);
      if (index !== -1) {
        this.removeFieldArray.splice(index, 1);
      }
    } else {
      // Add disabled tag to field
      document.getElementById(`editUser_${field}`).setAttribute('disabled', '');
      // Add field to the removeFiledArray. We will use this array to determine which fields get cleared
      this.removeFieldArray.push(field);
    }
  }*/

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
          } else {
            this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
          }
        });

      } else {
        // User object was not changed
        console.log('There are no changes to the user object');
        this.notifierService.notify('warning', 'There were no changes made.');
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

    // const user = {};
    // const keys = Object.keys(form.controls);

    const user = {
      firstName: 'Max',
      lastName: 'Bado',
      phone: '+17328597839',
      email: 'max.bado@gmail.com',
      securityRoleId: 1,
      securityRoleName: 'employee',
      departmentId: 2,
      departmentName: 'Front Desk',
      username: 'max-test2',
      gender: 'Male',
      middleName: 'R',
    };

    this.userService.addUser(user).subscribe(addResult => {
      console.log(addResult);
      if (addResult.status !== false) {
        this.notifierService.notify('success', 'User record added successfully.');
      } else {
        this.notifierService.notify('error', `Submission error: ${addResult.message}`);
      }
    });

    console.log(user);

/*    // Proceed only if the form is valid
    if (!form.invalid) {
      // Format the phone number
      const phone = `+1${this.validatePhoneNumber(form.controls.phone.value)}`;

      /!*
      Iterate over the form field keys and add the key/value pair to the user object we'll be passing
      to the addUser function.
      *!/
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
        } else {
          this.notifierService.notify('error', `Submission error: ${addResult.message}`);
        }
      });

      console.log(user);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }*/
  }

  pictureUpload() {

  }
  onLogout() {
    this.authService.signOut().then();
    resetStores();
    this.router.navigate(['/login']).then();
  }

  onSelectUser(event) {
    console.log(event.value);
  }

//uploadFile(event:any){
// let file = event.target.files[0];
//let fileName = file.name;
// console.log(file)
// console.log(fileName)
// let formData = new FormData();
// formData.append('file',file);
// this.examService.uploadAnswer(formData);
// }
}


// fileChangeEvent(event: any): void {
//    this.imageChangedEvent = event;
//  }

//  onImageSelected(event) {
//    const functionName = 'onImageSelected';
//    const functionFullName = `${this.componentName} ${functionName}`;
//    console.log(`Start ${functionFullName}`);
//
//    console.log(`${functionFullName}: event: ${event}`);
//    console.log(`${functionFullName}: this.croppedImage: ${this.croppedImage}`);
//
//
//    this.avatarService.saveUserAvatar(this.croppedImage).subscribe((saveResult) => {
//      console.log(`${functionFullName}: saveResult: ${saveResult}`);
//      if (saveResult === true) {
//        this.avatarUpload = false;
//        this.avatarPreview = true;
//        this.achievementService.incrementAchievement('ChangeAvatar').subscribe();
//      }
//
//    });
//  }

