import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { UserService } from '../../shared/user.service';
import { AchievementService} from '../../shared/achievement/achievement.service';
import {Department} from '../../shared/department.model';
import {promise} from 'selenium-webdriver';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { NotifierService} from 'angular-notifier';
import {AchievementComponent} from '../../shared/achievement/achievement.component';
import {SecurityRoleService} from '../../shared/securityRole.service';
import {DepartmentService} from '../../shared/department.service';
import {GlobalVariableService} from '../../shared/global-variable.service';
import {SessionService} from '../../shared/session.service';
import {AmplifyService} from 'aws-amplify-angular';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment';
import {SecurityRole} from '../../shared/securityrole.model';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  // styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  componentName = 'sign-in.component';
  hide = true;
  // returnUrl: string;
  private userDetails;
  //private departments: Department[];
  constructor(private achievementService: AchievementService,
              public userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private notifierService: NotifierService,
              private achievementComponent: AchievementComponent,
              private securityRoleService: SecurityRoleService,
              private departmentService: DepartmentService,
              private sessionService: SessionService,
              private amplifyService: AmplifyService,
              public auth: AuthService,
              private spinner: NgxSpinnerService) { }

  model = {
    username : '',
    password: ''
  };
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  serverErrorMessages: string;


  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.userService.isLoggedIn()
      .then(result => {
        if (result) {
          this.router.navigateByUrl('/user');
        }
      });
/*    if (this.userService.isLoggedIn()) {
      this.router.navigateByUrl('/user');
    }*/

  }

  onSubmit(form: NgForm) {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: Showing sign-in-onSubmit-spinner`);
    this.spinner.show('sign-in-onSubmit-spinner');
    console.log(form.value);
    this.auth.signIn(form.value.username, form.value.password)
      .then((user: CognitoUser|any) => {
        console.log(`${functionFullName}: Success!`);
        console.log(user);
        console.log(`${functionFullName}: storeUserDetails`);
        this.userService.getUserProfile()
          .subscribe((userData: any) => {
            console.log(userData);
            const userDetails = userData;
            localStorage.setItem('userId', userDetails.id);
            localStorage.setItem('username', userDetails.username);
            localStorage.setItem('firstName', userDetails.firstName);
            localStorage.setItem('lastName', userDetails.lastName);
            localStorage.setItem('points', userDetails.points);
            localStorage.setItem('email', userDetails.email);
            localStorage.setItem('securityRoleId', userDetails.securityRoleId);
            localStorage.setItem('departmentId', userDetails.departmentId);

            this.securityRoleService.getSecurityRoleById(+userDetails.securityRoleId)
              .subscribe((securityRole: SecurityRole) => {
                console.log(`${functionFullName}: this.securityRoleService.getSecurityRoleById(userDetails.securityRoleId):`);
                console.log(securityRole);
                localStorage.setItem('securityRoleName', securityRole.Name);
                localStorage.setItem('securityRoleDescription', securityRole.Description);
              });

            this.departmentService.getDepartmentById(+userDetails.departmentId)
              .subscribe((department: Department) => {
                console.log(`${functionFullName}: this.departmentService.getDepartmentById(userDetails.departmentId):`);
                console.log(department);
                localStorage.setItem('departmentName', department.Name);
              });

            //this.achievementService.incrementAchievementSignIn(userDetails.id)
           this.achievementService.incrementAchievement('SignIn')
              .subscribe((result: any) => {
                console.log(`${functionFullName}: incrementAchievementSignIn result:`);
                console.log(result);
                if ( !result ) {
                  console.log(`${functionFullName}: Did not receive response from incrementAchievement: SignIn`);
                } else {
                  if ( result.status !== true) {
                    console.log(`${functionFullName}: Something went wrong...`);
                    console.log(result.message);
                  } else {
                    console.log(`${functionFullName}: Success`);
                    console.log(result.message);
                    // this.achievementComponent.getUserAchievements();
                  }
                }
              });

            // this.router.navigate(['/user/' + userDetails.securityRoleId]);
            // this.sessionService.SetSessionLoggedIn();
            console.log(`${functionFullName}: Hiding sign-in-onSubmit-spinner`);
            this.spinner.hide('sign-in-onSubmit-spinner');
            this.router.navigate(['/user']);
            // this.router.navigate(['/user/' + userDetails.securityRoleId]);
          });
      })
      .catch((error: any) => {
        // this._loader.hide();
        // this._notification.show(error.message);
        this.notifierService.notify('Error', error.message);
        switch (error.code) {
          case 'UserNotConfirmedException':
            console.log(`${functionFullName}: UserNotConfirmedException`);
            environment.confirm.email = form.value.username;
            environment.confirm.password = form.value.password;
            this.router.navigateByUrl('/confirm');
            break;
          case 'UsernameExistsException':
            console.log(`${functionFullName}: UsernameExistsException`);
            this.router.navigateByUrl('/signin');
            break;
        }
      });
  }

/*  navigateToHome() {
    const functionName = 'navigateToHome';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: sign-in navigateToHome:`);
    const userRole = this.userDetails.securityRole;
    console.log('userRole: ' + userRole);
    console.log(userRole);
  }*/
}
