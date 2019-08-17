import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {SecurityRole} from '../../shared/securityrole.model';
import {UserService} from '../../shared/user.service';
import {DepartmentService} from '../../shared/department.service';
import {SecurityRoleService} from '../../shared/securityRole.service';
import {Department} from '../../shared/department.model';
import {map} from 'rxjs/operators';
import {AmplifyService} from 'aws-amplify-angular';
import {AuthService} from '../auth.service';
import { environment } from 'src/environments/environment';
import {Router} from '@angular/router';
import {GlobalVariableService} from '../../shared/global-variable.service';
import {User} from '../../shared/user.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  componentName = 'sign-up.component';
  hide = true;

  departments: Department[];
  securityRoles: SecurityRole[];

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSuccessMessage: boolean;
  serverErrorMessages: string;

  selectedUser = this.userService.selectedUser;

  constructor(
    public userService: UserService,
    private departmentService: DepartmentService,
    private securityRoleService: SecurityRoleService,
    private amplifyService: AmplifyService,
    private _authService: AuthService,
    private _router: Router,
    private globalVariableService: GlobalVariableService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: populate departments`);
    this.departmentService.getDepartments()
      .subscribe((departments: Department[]) => {
        this.departments = departments;

        console.log(`${functionFullName}: retrieved departments from departmentService.getDepartments()`);
        console.log(this.departments);
      });

    console.log(`${functionFullName}: populate securityRoles`);
    this.securityRoleService.getSecurityRoles()
      .subscribe((securityRoles: SecurityRole[]) => {
        this.securityRoles = securityRoles;

        console.log(`${functionFullName}: retrieved securityRoles from securityRoleService.getSecurityRoles()`);
        console.log(this.securityRoles);
      }
    );
  }


  onSubmit(form: NgForm) {
    console.log('onSubmit');
    console.log(form.value);

    this.userService.postUser(form.value)
      .subscribe(res => {
          // this.showSuccessMessage = true;
          // setTimeout(() => this.showSuccessMessage = false, 4000);


          this._authService.signUp({
            'username': form.value.username,
            'email': form.value.email,
            'password': form.value.password,
            'firstName': form.value.firstName,
            'lastName': form.value.lastName,
            'gender': '',
            'profile': '',
            'picture': '',
            'name': `${form.value.firstName} ${form.value.lastName}`,
            'middleName': '',
            'phone': form.value.phone,
            'birthdate': '03/07/1985',
            'department': form.value.department.Name,
            'departmentId': form.value.department.Id,
            'securityRole': form.value.securityRole.Name,
            'securityRoleId': form.value.securityRole.Id
          })
            .then((data) => {
              environment.confirm.email = form.value.email;
              environment.confirm.password = form.value.password;
              environment.confirm.username = form.value.username;
              this.resetForm(form);
              this._router.navigateByUrl('/confirm');
            })
            .catch((error) => console.log(error));
        },
        err => {
          if (err.status === 422) {
            this.serverErrorMessages = err.error.join('<br/>');
          } else {
            this.serverErrorMessages = 'Something went wrong. Please contact admin.';
          }
        }
      );
  }

  /*
  signUp() {

    this._authService.signUp({
      "email": this.emailInput.value,
      "password": this.passwordInput.value,
      "firstName": this.fnameInput.value,
      "lastName": this.lnameInput.value
    })
      .then((data) => {
        environment.confirm.email = this.emailInput.value;
        environment.confirm.password = this.passwordInput.value;
        this._router.navigate(['auth/confirm']);
      })
      .catch((error) => console.log(error));
  }
  */

  testRegister() {
    const functionName = 'testRegister';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const securityRole: SecurityRole = {
      Id: 1,
      Name: 'employee',
      Description: 'Standard employee'
    };

    const department: Department = {
      Id: 1,
      Name: 'Kitchen',
    };

    const testUser: User = {
      username: 'mbado',
      firstName: 'Max',
      lastName: 'Bado',
      email: 'max.bado@gmail.com',
      securityRole: securityRole,
      department: department,
      points: 0,
      password: 'D@RTHtest911',
      phone: '+17328597839',
      birthdate: ''
    };

    this.userService.postUser(testUser)
      .subscribe(result => {
        console.log(`${functionFullName}: Register User result:`);
        console.log(result);
      });
  }

  resetForm(form: NgForm) {
    this.userService.selectedUser = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      securityRole: null,
      department: null,
      points: 0,
      password: '',
      phone: '',
      birthdate: '',
    };
    form.resetForm();
    this.serverErrorMessages = '';
  }


}
