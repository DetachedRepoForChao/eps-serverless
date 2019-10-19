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
  editUserForm: FormGroup;
  selectUserForm: FormGroup;
  selectedUser;
  removeFieldArray = [];


  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.userService.cacheUsers().subscribe();
    this.loadEditUserForm();
    this.loadSelectUserForm();
/*    this.selectUserForm.valueChanges.subscribe((result) => {
      console.log(result);
      this.selectedUser = result;
      console.log(this.selectedUser.editUserUsername.email);
    });*/

    this.editUserForm.get('editUserUsername').valueChanges.subscribe(user => {
      console.log(user);
      this.editUserForm.patchValue({editUserFirstName: user.firstName});
      this.editUserForm.patchValue({editUserLastName: user.lastName});
      this.editUserForm.patchValue({editUserAddress1: user.address1});
      this.editUserForm.patchValue({editUserAddress2: user.address2});
      this.editUserForm.patchValue({editUserCity: user.city});
      this.editUserForm.patchValue({editUserState: user.state});
      this.editUserForm.patchValue({editUserCountry: user.country});
      this.editUserForm.patchValue({editUserZip: user.zip});
      this.editUserForm.patchValue({editUserBirthdate: user.birthdate});
      this.editUserForm.patchValue({editUserEmail: user.email});
      this.editUserForm.patchValue({editUserPhone: user.phone});
    });

  }

  private loadSelectUserForm() {
    this.selectUserForm = this.formBuilder.group({
      editUserUsername: [null],
    });
  }

  private loadEditUserForm() {
    this.editUserForm = this.formBuilder.group({
      editUserUsername: [null, Validators.required],
      editUserFirstName: [null, Validators.required],
      editUserLastName: [null, Validators.required],
      editUserAddress1: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)])],
      editUserAddress2: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)])],
      editUserCity: [null, Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(14)])],
      editUserState: [null],
      editUserCountry: [null],
      editUserZip: [null, Validators.compose([Validators.required, Validators.pattern(this.zipPattern)])],
      editUserBirthdate: [null],
      editUserEmail: [null, Validators.compose([Validators.required, Validators.email])],
      editUserPhone: [null, Validators.compose([Validators.required, Validators.maxLength(10)])]
    });
  }

  toggleRemoveField(field: string) {
    if (document.getElementById(field).attributes.getNamedItem('disabled')) {
      // Remove disabled tag from field
      document.getElementById(field).attributes.removeNamedItem('disabled');

      // Remove field from the removeFieldArray
      const index: number = this.removeFieldArray.indexOf(field);
      if (index !== -1) {
        this.removeFieldArray.splice(index, 1);
      }
    } else {
      // Add disabled tag to field
      document.getElementById(field).setAttribute('disabled', '');

      // Add field to the removeFiledArray. We will use this array to determine which fields get cleared
      this.removeFieldArray.push(field);
    }

  }

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

  onEditUserFormSubmit(form) {
    console.log(form);
    console.log(this.removeFieldArray);
    const phone = this.validatePhoneNumber(form.controls.editUserPhone.value);
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
