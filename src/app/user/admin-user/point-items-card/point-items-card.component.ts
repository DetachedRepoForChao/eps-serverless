import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../../globals';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {AuthService} from '../../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {forkJoin, Observable} from 'rxjs';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../../environments/environment';
import {PointItemService} from '../../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../../entity-store/point-item/state/point-item.query';


export function requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
  return function validate (formGroup: FormGroup) {
    let checked = 0;

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];

      if (control.value === true) {
        checked ++;
      }
    });

    if (checked < minRequired) {
      return {
        requireCheckboxesToBeChecked: true,
      };
    }

    return null;
  };
}

@Component({
  selector: 'app-point-items-card',
  templateUrl: './point-items-card.component.html',
  styleUrls: ['./point-items-card.component.css']
})

export class PointItemsCardComponent implements OnInit {

  componentName = 'point-items-card.component';
  public config: PerfectScrollbarConfigInterface = {};
  addPointItemForm: FormGroup;
  addPointItemFormSubmitted = false;
  editPointItemForm: FormGroup;
  editPointItemFormSubmitted = false;
  deletePointItemForm: FormGroup;
  deletePointItemFormSubmitted = false;

  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              private securityRoleService: SecurityRoleService,
              private notifierService: NotifierService) { }

  ngOnInit() {

    this.pointItemService.cachePointItems().subscribe();

    // Build the reactive Edit User form
    this.loadAddPointItemForm();
    this.loadEditPointItemForm();
    this.loadDeletePointItemForm();

    // Subscribe to change events for the 'user' field. Every time a new user is selected, the corresponding fields will populate with data
    this.editPointItemForm.get('pointItem').valueChanges.subscribe(pointItem => {
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

    this.deletePointItemForm.get('pointItem').valueChanges.subscribe(pointItem => {
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

  private loadDeletePointItemForm() {
    this.deletePointItemForm = this.formBuilder.group({
      pointItem: [null, Validators.required],
    });
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
}
