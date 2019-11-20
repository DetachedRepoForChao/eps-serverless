import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {SecurityRole} from '../../shared/securityrole.model';
import {UserService} from '../../shared/user.service';
import {DepartmentService} from '../../shared/department.service';
import {SecurityRoleService} from '../../shared/securityRole.service';
import {Department} from '../../shared/department.model';
import {map, tap} from 'rxjs/operators';
import {AuthService} from '../auth.service';
import { environment } from 'src/environments/environment';
import {Router} from '@angular/router';
import {User} from '../../shared/user.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin} from 'rxjs';
import {PhonePipe} from '../../pipe/phone.pipe';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  componentName = 'sign-up.component';
  hide = true;
  isCardLoading: boolean;
  departments: Department[];
  securityRoles: SecurityRole[];

  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSuccessMessage: boolean;
  serverErrorMessages: string;

  selectedUser = this.userService.selectedUser;
  signUpForm: FormGroup;
  isSubmitted = false;
  phoneValidationError: string;

  constructor(
    public userService: UserService,
    private departmentService: DepartmentService,
    private securityRoleService: SecurityRoleService,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public formBuilder: FormBuilder) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.spinner.show('signup-spinner');

    const observables: Observable<any>[] = [];

    const departments$ = this.departmentService.getDepartments()
      .pipe(
        tap((departments: Department[]) => {
          // console.log(departments);
          this.departments = departments;
        })
      );

    const securityRoles$ = this.securityRoleService.getSecurityRoles()
      .pipe(
        tap((securityRoles: SecurityRole[]) => {
          // console.log(securityRoles);
          this.securityRoles = securityRoles;
        })
      );

    observables.push(departments$);
    observables.push(securityRoles$);

    forkJoin(observables)
      .subscribe(() => {
        this.isCardLoading = false;
        this.spinner.hide('signup-spinner');
      });

    this.buildForm();
  }

  buildForm() {
    this.signUpForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      securityRole: new FormControl('', [Validators.required]),
      department: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      phone: new FormControl('', [Validators.required]),
    });
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

  onSubmit(form: FormGroup) {
    console.log('onSubmit');
    console.log(form.value);
    this.isSubmitted = true;
    const phone = this.validatePhoneNumber(form.controls.phone.value);
    this.userService.postUser(form.value)
      .subscribe(res => {

          this.authService.signUp({
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
            'phone': `+1${phone}`, // Add +1 for the US country code
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
              this.router.navigateByUrl('/confirm');
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

  resetForm(form: FormGroup) {
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
    form.reset();
    this.serverErrorMessages = '';
    this.isSubmitted = false;
  }


}
