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
import {catchError, take, takeUntil, tap} from 'rxjs/operators';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {forkJoin, Observable, of, Subject, throwError} from 'rxjs';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../../environments/environment';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {requireCheckboxesToBeCheckedValidator} from '../point-items-card/point-items-card.component';
import {NotificationModel} from '../../../entity-store/notification/state/notification.model';
import {CurrentUserFilterModel} from '../../../entity-store/current-user/filter/current-user-filter.model';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';

export function managerValidation(pointPoolMax: number): ValidatorFn {
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
  private currentUserLoading$ = new Subject();

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
  purchaseApproverForm: FormGroup;
  newPurchaseApproverFormSubmitted = false;
  today = new Date(Date.now());
  departments: Department[];
  securityRoles: SecurityRole[];
  users: EntityUserModel[];
  adminUsers: EntityUserModel[];
  deactivatedUsers: EntityUserModel[];
  currentUser: EntityCurrentUserModel;
  public pointPoolMax: number;
  public purchaseApprovers = [];
  public purchaseApproverToDelete: any;
  // public currentUserEmailConfirmed = false;
  // public currentUserPhoneConfirmed = false;
  public emailConfirmed = false;
  public phoneConfirmed = false;


  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private userService: EntityUserService,
              public userQuery: EntityUserQuery,
              private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              private securityRoleService: SecurityRoleService,
              private currentUserQuery: EntityCurrentUserQuery,
              private notifierService: NotifierService) { }

  ngOnInit() {
    // this.userService.cacheUsers().subscribe();

    this.authService.currentUserInfo()
      .then(currentUserInfo => {
        console.log(currentUserInfo);
        this.emailConfirmed = currentUserInfo.attributes['email_verified'];
        this.phoneConfirmed = currentUserInfo.attributes['phone_number_verified'];
      })
      .catch(err => {
        console.log('Error...', err);
      });

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
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


    this.securityRoleService.getSecurityRoles()
      .pipe(
        take(1),
        catchError(err => {
          console.log('Error...', err);
          return throwError(err);
        })
      )
      .subscribe(
        (securityRoles: SecurityRole[]) => {
          this.securityRoles = securityRoles;
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Completed.');
        }
      );

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

          this.userQuery.selectAdminUsers()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((adminUsers: EntityUserModel[]) => {
              this.adminUsers = adminUsers;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    this.userService.getPointPoolMax()
      .pipe(
        take(1),
        catchError(err => {
          console.log('Error...', err);
          return throwError(err);
        })
      )
      .subscribe(
        (response) => {
          console.log(response);
          this.pointPoolMax = response;
          this.loadAddUserForm();
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Completed.');
        }
      );

    this.retrievePurchaseApprovers();

    // load reactive forms
    this.loadEditUserForm();
    this.initializeEditUserForm();
    this.loadDeleteUserForm();
    this.loadActivateUserForm();
    this.loadPurchaseApproverForm();



    this.purchaseApproverForm.controls.group.get('purchaseApprover').valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        console.log(user);

        this.userService.getCognitoUser(user.username)
          .pipe(
            take(1),
            catchError(err => {
              console.log('Error...', err);
              return throwError(err);
            })
          )
          .subscribe(
            (cognitoUser) => {
              console.log(cognitoUser);
              this.emailConfirmed = (cognitoUser.UserAttributes.find(x => x.Name === 'email_verified').Value === 'true');
              this.phoneConfirmed = (cognitoUser.UserAttributes.find(x => x.Name === 'phone_number_verified').Value === 'true');
              console.log('email confirmed', this.emailConfirmed);
              console.log('email confirmed', false);
              console.log('phone confirmed', this.phoneConfirmed);

            },
            (err) => {
              console.log(err);
            },
            () => {
              console.log('Completed.');
            }
          );
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

  retrievePurchaseApprovers() {
    this.userService.getPurchaseApprovers()
      .pipe(
        take(1),
        catchError(err => {
          console.log('Error...', err);
          return throwError(err);
        })
      )
      .subscribe(
        (response) => {
          console.log(response);
          this.purchaseApprovers = response;
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Completed.');
        }
      );
  }

  initializeEditUserForm() {
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

  private loadPurchaseApproverForm() {
    this.purchaseApproverForm = this.formBuilder.group({
      phoneNotifications:  new FormControl(false),
      emailNotifications:  new FormControl(true),
      group: new FormGroup({
        purchaseApprover: new FormControl(null, Validators.required),
      }, this.isPurchaseManagerValidation()),
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
        console.log(keys[i]);
        if (keys[i] === 'roleGroup') {
          const groupKeys = Object.keys(form.controls.roleGroup.value);
          for (const groupKey of groupKeys) {
            const groupKeyValue = form.controls.roleGroup.get(groupKey).value;
            console.log(groupKey);
            // Special consideration for nested objects like securityRole and department
            switch (groupKey) { // we need to account for securityRole and department objects
              case 'securityRole': {
                if (sourceUser[groupKey].Id === groupKeyValue.Id) {
                  // No change
                } else {
                  console.log('Value changed:');
                  console.log(groupKeyValue);
                  user['securityRoleId'] = groupKeyValue.Id;
                  user['securityRoleName'] = groupKeyValue.Name;
                }

                break;
              }
              case 'pointsPool': {
                if (sourceUser[groupKey] === groupKeyValue) {
                  // No change
                } else {
                  console.log('Value changed:');
                  console.log(groupKeyValue);
                  user[groupKey] = groupKeyValue;
                }

                break;
              }
            }
          }
        } else if (keys[i] === 'department') {
          const keyValue = form.controls[keys[i]].value;
          console.log(keys[i]);
          // Special consideration for nested objects like securityRole and department
          if (sourceUser[keys[i]].Id === keyValue.Id) {
            // No change
          } else {
            console.log('Value changed:');
            console.log(keyValue);

            user['departmentId'] = keyValue.Id;
            user['departmentName'] = keyValue.Name;
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
            if (modifyResult.data.status !== false) {
              if (modifyResult.errors.length > 0) {
                this.notifierService.notify('warning', 'User record updated with errors.');
                for (const error of modifyResult.errors) {
                  this.notifierService.notify('error', error.message);
                }

                this.editUserFormSubmitted = false;
              } else {
                this.notifierService.notify('success', 'User record updated successfully.');
                this.editUserFormSubmitted = false;
              }
            } else {
              this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
            }

            form.reset();
            this.initializeEditUserForm();
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

  onNewPurchaseApproverFormSubmit(form: FormGroup) {
    console.log(form);
    this.newPurchaseApproverFormSubmitted = true;

    const purchaseApprover = {
      userId: null,
      phoneNotifications: false,
      emailNotifications: true,
    };

    if (!form.invalid) {
      const user = form.controls.group.get('purchaseApprover').value;
      purchaseApprover.userId = user.userId;
      purchaseApprover.phoneNotifications = form.controls.phoneNotifications.value;
      purchaseApprover.emailNotifications = form.controls.emailNotifications.value;
      this.userService.newPurchaseApprover(purchaseApprover)
        .pipe(
          take(1),
          catchError(err => {
            console.log('Error...', err);
            return throwError(err);
          })
        )
        .subscribe(
          (response) => {
            console.log(response);
            this.notifierService.notify('success', 'User successfully added as a Purchase Manager.');
            this.newPurchaseApproverFormSubmitted = false;
            this.retrievePurchaseApprovers();
            form.reset();
          },
          (err) => {
            console.log(err);
            if (err.error) {
              this.notifierService.notify('error', `Submission error: ${err.error}`);
            }

            if (err.message) {
              this.notifierService.notify('error', `Submission error message: ${err.message}`);
            }

          },
          () => {
            console.log('Completed.');
          }
        );

      console.log(user);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  purchaseApproverDeleteToggle(purchaseApprover: any) {
    if (this.purchaseApproverToDelete === purchaseApprover) {
      this.purchaseApproverToDelete = null;
      return;
    }
    this.purchaseApproverToDelete = purchaseApprover;
  }

  deletePurchaseApprover(purchaseApprover: any) {
    console.log(`Deleting purchase approver ${purchaseApprover.userId}`);
    this.userService.deletePurchaseApprover(purchaseApprover.userId)
      .pipe(
        take(1),
        catchError(err => {
          console.log('Error...', err);
          return throwError(err);
        })
      )
      .subscribe(
        (response) => {
          console.log(response);
          this.notifierService.notify('success', 'Purchase Manager deleted successfully.');
          this.retrievePurchaseApprovers();
        },
        (err) => {
          console.log(err);
          if (err.error) {
            this.notifierService.notify('error', `Error: ${err.error}`);
          }

          if (err.message) {
            this.notifierService.notify('error', `Error message: ${err.message}`);
          }

        },
        () => {
          console.log('Completed.');
        }
      );
  }

  isPurchaseManagerValidation(): ValidatorFn {
    const parentScope = this;
    return function validate(formGroup: FormGroup) {
      const userId = (formGroup.controls.purchaseApprover.value) ? formGroup.controls.purchaseApprover.value.userId : null;
      if (parentScope.isUserPurchaseManager(userId)) {
        console.log('invalid');
        return {
          isPurchaseManager: true
        };
      }
      console.log('valid');
      return null;
    };
  }

  isUserPurchaseManager(userId) {
    return !!this.purchaseApprovers.find(x => x.userId === userId);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.usersLoading$.next();
    this.usersLoading$.complete();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
  }
}
