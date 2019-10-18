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

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  editUserForm: FormGroup;
  selectUserForm: FormGroup;
  selectedUser;

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

    this.selectedUser = this.selectUserForm.valueChanges.subscribe(value => {
      const user = value.editUserUsername;
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
      editUserFirstName: [null, Validators.required],
      editUserLastName: [null, Validators.required],
      editUserAddress1: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)])],
      editUserAddress2: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)])],
      editUserCity: [null, Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(14)])],
      editUserState: [null],
      editUserZip: [null, Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(14)])],
      editUserBirthdate: [null],
      editUserEmail: [null],
      editUserPhone: [null]
    });
  }

  onEditUserFormSubmit(form) {
    console.log(form);
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
