import { Component, OnInit } from '@angular/core';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {UserService} from '../../../shared/user.service';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {map} from 'rxjs/operators';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {
  hide = true;

  departments: Department[];
  securityRoles: SecurityRole[];

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSuccessMessage: boolean;
  serverErrorMessages: string;

  constructor(
    public userService: UserService,
    private departmentService: DepartmentService,
    private securityRoleService: SecurityRoleService) { }

  ngOnInit() {
    //console.log(this.role);
    //console.log(this.keys());
    // this.getDepartments().subscribe(deps => {
    //     this.departments = deps;
    //     for (let i = 0; i < deps.length; i++) {
    //       console.log(deps[i]);
    //     }
    //   }
    // );

    this.departmentService.getDepartments().subscribe((deps: Department[]) => {
        this.departments = deps;
        for (let i = 0; i < deps.length; i++) {
          console.log(deps[i]);
        }
      }
    );

    this.securityRoleService.getSecurityRoles().subscribe((secRoles: SecurityRole[]) => {
        this.securityRoles = secRoles;
        for (let i = 0; i < secRoles.length; i++) {
          console.log(secRoles[i]);
        }
      }
    );
  }



  onSubmit(form: NgForm) {
    console.log('onSubmit');
    this.userService.postUser(form.value)
      .then(res => {
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 4000);
        this.resetForm(form);
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

  resetForm(form: NgForm) {
    this.userService.selectedUser = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      securityRole: '',
      department: '',
      points: 0,
      password: ''
    };
    form.resetForm();
    this.serverErrorMessages = '';
  }

}
