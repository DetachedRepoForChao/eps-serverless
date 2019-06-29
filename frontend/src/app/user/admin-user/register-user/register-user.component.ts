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
    this.getDepartments().subscribe(deps => {
        this.departments = deps;
        for (let i = 0; i < deps.length; i++) {
          console.log(deps[i]);
        }
      }
    );

    this.getSecurityRoles().subscribe(secRoles => {
        this.securityRoles = secRoles;
        for (let i = 0; i < secRoles.length; i++) {
          console.log(secRoles[i]);
        }
      }
    );
  }

  getSecurityRoles() {
    console.log('getSecurityRoles');
    return this.securityRoleService.getSecurityRoles()
      .pipe(
        map(data => {
          return data['securityRoles'];
        }));
  }


  getDepartments() {
    console.log('getDepartments');
    return this.departmentService.getDepartments()
      .pipe(
        map(data => {
          return data['departments'];
        }));
  }


  onSubmit(form: NgForm) {
    console.log('onSubmit');
    this.userService.postUser(form.value).subscribe(
      res => {
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
