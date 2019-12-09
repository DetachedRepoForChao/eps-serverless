import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../../globals';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {AuthService} from '../../../login/auth.service';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {StoreItemQuery} from '../../../entity-store/store-item/state/store-item.query';
import {ImageCroppedEvent} from 'ngx-image-cropper';

@Component({
  selector: 'app-store-items-card',
  templateUrl: './store-items-card.component.html',
  styleUrls: ['./store-items-card.component.css']
})
export class StoreItemsCardComponent implements OnInit {
  componentName = 'store-items-card.component';
  public config: PerfectScrollbarConfigInterface = {};
  addStoreItemForm: FormGroup;
  addStoreItemFormSubmitted = false;
  editStoreItemForm: FormGroup;
  editStoreItemFormSubmitted = false;
  deleteStoreItemForm: FormGroup;
  deleteStoreItemFormSubmitted = false;
  addItemImageChangedEvent: any = '';
  editItemImageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageToShow: any = '';
  addItemCroppedImageToShow: any = '';
  addItemCroppedImage: any = '';
  editItemCroppedImageToShow: any = '';
  editItemCroppedImage: any = '';

  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private storeItemService: StoreItemService,
              public storeItemQuery: StoreItemQuery,
              private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              private securityRoleService: SecurityRoleService,
              private notifierService: NotifierService) { }

  ngOnInit() {

    // this.storeItemService.cacheStoreItems().subscribe();

    // Load the reactive forms
    this.loadAddStoreItemForm();
    this.loadEditStoreItemForm();
    this.loadDeleteStoreItemForm();

    // Subscribe to change events for the 'storeItem' field. Every time a new storeItem is selected,
    // the corresponding fields will populate with data
    this.editStoreItemForm.get('storeItem').valueChanges.subscribe(storeItem => {
      console.log(storeItem);
      this.editItemImageChangedEvent = null;
      this.editItemCroppedImage = null;
      this.editItemCroppedImageToShow = null;

      const keys = Object.keys(storeItem);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        console.log(key);
        if (key === 'imageResolvedUrl') {
          this.editStoreItemForm.patchValue({image: storeItem[keys[i]]});
        } else {
          this.editStoreItemForm.patchValue({[key]: storeItem[keys[i]]});
        }
      }
    });

    // Subscribe to change events for the 'storeItem' field. Every time a new storeItem is selected,
    // the corresponding fields will populate with data
    this.deleteStoreItemForm.get('storeItem').valueChanges.subscribe(storeItem => {
      console.log(storeItem);

      const keys = Object.keys(storeItem);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (this.deleteStoreItemForm.get(key)) {
          this.deleteStoreItemForm.patchValue({[key]: storeItem[keys[i]]});
        }
      }
    });
  }

  private loadEditStoreItemForm() {
    this.editStoreItemForm = this.formBuilder.group({
      storeItem: [null, Validators.required],
      name: [null, Validators.required],
      description: [null],
      cost: [null, Validators.required],
      image: [null, Validators.required],
    });
  }

  private loadAddStoreItemForm() {
    this.addStoreItemForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null],
      cost: [null, Validators.required],
      image: [null, Validators.required],
    });
  }

  private loadDeleteStoreItemForm() {
    this.deleteStoreItemForm = this.formBuilder.group({
      storeItem: [null, Validators.required],
    });
  }

  onEditStoreItemFormSubmit(form: FormGroup) {
    console.log(form);
    this.editStoreItemFormSubmitted = true;
    const sourceStoreItem = form.controls.storeItem.value;
    const storeItem = {};
    const keys = Object.keys(form.controls);

    // Proceed only if the form is valid
    if (!form.invalid) {
      /*
      Iterate over the form field keys and add the key/value pair to the storeItem object we'll be passing
      to the modifyStoreItem function.
      */
      for (let i = 0; i < keys.length; i++) {
        if ((keys[i] !== 'storeItem') && (keys[i] !== 'imageResolvedUrl') && (keys[i] !== 'image')) {
          if (sourceStoreItem[keys[i]] === form.controls[keys[i]].value) {
            // Don't add the key/value pair if the new value is the same as the source
          } else {
            // If the value has changed, add key/value pair to the storeItem object
            console.log('Value changed:');
            console.log(form.controls[keys[i]].value);
            storeItem[keys[i]] = form.controls[keys[i]].value;
          }
        }
      }

      // Set new image if one was selected
      if (this.editItemCroppedImage) {
        storeItem['image'] = this.editItemCroppedImage;
        // Set path for store item image
        const fileDir = 'store';
        const fileName = 'store_item_' + form.controls.name.value.toString().replace(' ', '_') + '.png';
        const filePath = `${fileDir}/${fileName}`;
        console.log(filePath);
        storeItem['imagePath'] = filePath;
      }

      if (Object.keys(storeItem).length > 0) {
        // Store Item object changes exist. Add the itemId to the storeItem object and invoke modifyStoreItem function
        storeItem['itemId'] = sourceStoreItem.itemId;
        this.storeItemService.modifyStoreItem(storeItem).subscribe(modifyResult => {
          console.log(modifyResult);
          if (modifyResult.status !== false) {
            this.notifierService.notify('success', 'Point item record updated successfully.');
            this.editStoreItemFormSubmitted = false;
          } else {
            this.notifierService.notify('error', `Submission error: ${modifyResult.message}`);
          }
        });
      } else {
        // Store Item object was not changed
        console.log('There are no changes to the store item object');
        this.notifierService.notify('warning', 'There were no changes made.');
        this.editStoreItemFormSubmitted = false;
      }

      console.log(storeItem);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onAddStoreItemFormSubmit(form: FormGroup) {
    console.log(form);
    this.addStoreItemFormSubmitted = true;
    const storeItem = {};
    const keys = Object.keys(form.controls);

    // Proceed only if the form is valid
    if (!form.invalid) {
      /*
      Iterate over the form field keys and add the key/value pair to the storeItem object we'll be passing
      to the newStoreItem function.
      */
      for (let i = 0; i < keys.length; i++) {
        storeItem[keys[i]] = form.controls[keys[i]].value;
      }

      storeItem['image'] = this.addItemCroppedImage;

      // Set path for store item image
      const fileDir = 'store';
      const fileName = 'store_item_' + form.controls.name.value.toString().replace(' ', '_') + '.png';
      const filePath = `${fileDir}/${fileName}`;
      console.log(filePath);
      storeItem['imagePath'] = filePath;

      this.storeItemService.newStoreItem(storeItem).subscribe(addResult => {
        console.log(addResult);
        if (addResult.status !== false) {
          this.notifierService.notify('success', 'Store item record added successfully.');
          this.addStoreItemFormSubmitted = false;
        } else {
          this.notifierService.notify('error', `Submission error: ${addResult.message}`);
        }
      });

      console.log(storeItem);
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onDeleteStoreItemFormSubmit(form: FormGroup) {
    console.log(form);
    this.deleteStoreItemFormSubmitted = true;
    let storeItem = {};

    if (!form.invalid) {
      storeItem = form.controls.storeItem.value;
      this.storeItemService.deleteStoreItem(storeItem).subscribe(deleteResult => {
        console.log(deleteResult);
        if (deleteResult.status !== false) {
          this.notifierService.notify('success', 'Store item record deleted successfully.');
          this.deleteStoreItemFormSubmitted = false;
        } else {
          this.notifierService.notify('error', `Submission error: ${deleteResult.message}`);
        }
      });
    } else {
      console.log('The form submission is invalid');
      this.notifierService.notify('error', 'Please fix the errors and try again.');
    }
  }

  onImageSelected(event) {
    const functionName = 'onImageSelected';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: event: ${event}`);
    console.log(`${functionFullName}: this.croppedImage: ${this.croppedImage}`);
  }

  addItemFileChangeEvent(event: any): void {
    this.addItemImageChangedEvent = event;
  }
  addItemImageCropped(event: ImageCroppedEvent) {
    this.addItemCroppedImageToShow = event.base64;
    this.addItemCroppedImage = event.file;
  }

  editItemFileChangeEvent(event: any): void {
    this.editItemImageChangedEvent = event;
  }
  editItemImageCropped(event: ImageCroppedEvent) {
    this.editItemCroppedImageToShow = event.base64;
    this.editItemCroppedImage = event.file;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

}
