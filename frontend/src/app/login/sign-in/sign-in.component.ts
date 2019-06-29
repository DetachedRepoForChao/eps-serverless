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


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  // styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
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
              private sessionService: SessionService) { }

  model = {
    username : '',
    password: ''
  };
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  serverErrorMessages: string;


  ngOnInit() {
    if (this.userService.isLoggedIn()) {
      this.router.navigateByUrl('/user');
    }
  }


  onSubmit(form: NgForm) {
    console.log(form.value);
    this.userService.login(form.value).subscribe(
      res => {
        this.userService.setToken(res['token']);
        console.log('storeUserDetails');
        this.userService.getUserProfile()
          .subscribe(userData => {
            console.log(userData['user']);
            const userDetails = userData['user'];
            localStorage.setItem('userId', userDetails.id);
            localStorage.setItem('username', userDetails.username);
            localStorage.setItem('firstName', userDetails.firstName);
            localStorage.setItem('lastName', userDetails.lastName);
            localStorage.setItem('points', userDetails.points);
            localStorage.setItem('email', userDetails.email);
            localStorage.setItem('securityRoleId', userDetails.securityRoleId);
            localStorage.setItem('departmentId', userDetails.departmentId);

            this.securityRoleService.getSecurityRoleById(userDetails.securityRoleId)
              .subscribe(securityData => {
                console.log(securityData['securityRole']);
                localStorage.setItem('securityRoleName', securityData['securityRole'].name);
                localStorage.setItem('securityRoleDescription', securityData['securityRole'].description);
              });

            this.departmentService.getDepartmentById(userDetails.departmentId)
              .subscribe(departmentData => {
                console.log(departmentData['department']);
                localStorage.setItem('departmentName', departmentData['department'].name);
              });

            /*
            //this.achievementService.incrementAchievementSignIn(userDetails.id)
            this.achievementService.incrementAchievement('SignIn', userDetails.id)
              .subscribe((result: any) => {
                console.log('incrementAchievementSignIn result:');
                console.log(result);
                if ( !result ) {
                  console.log('Did not receive response from incrementAchievementSignIn');
                } else {
                  if ( result.status !== true) {
                    console.log('Something went wrong...');
                    console.log(result.message);
                  } else {
                    console.log('Success');
                    console.log(result.message);
                    this.achievementComponent.getUserAchievements();
                  }
                }
              });
            */

            // this.router.navigate(['/user/' + userDetails.securityRoleId]);
            this.sessionService.SetSessionLoggedIn();
            this.router.navigate(['/user']);
            // this.router.navigate(['/user/' + userDetails.securityRoleId]);
          });
      },
      err => {
        this.serverErrorMessages = err.error.message;
      }
    );
  }

  storeUserDetails() {
    console.log('storeUserDetails');
    this.userService.getUserProfile()
      .subscribe(userData => {
        console.log(userData['user']);
        const userDetails = userData['user'];
        localStorage.setItem('userId', userDetails.id);
        localStorage.setItem('username', userDetails.username);
        localStorage.setItem('firstName', userDetails.firstName);
        localStorage.setItem('lastName', userDetails.lastName);
        localStorage.setItem('points', userDetails.points);
        localStorage.setItem('email', userDetails.email);
        localStorage.setItem('securityRoleId', userDetails.securityRoleId);
        localStorage.setItem('departmentId', userDetails.departmentId);

        this.securityRoleService.getSecurityRoleById(userDetails.securityRoleId)
          .subscribe(securityData => {
            console.log(securityData['securityRole']);
            localStorage.setItem('securityRoleName', securityData['securityRole'].name);
            localStorage.setItem('securityRoleDescription', securityData['securityRole'].description);
          });

        this.departmentService.getDepartmentById(userDetails.departmentId)
          .subscribe(departmentData => {
            console.log(departmentData['department']);
            localStorage.setItem('departmentName', departmentData['department'].name);
          });

      });
  }

  getUserDetails() {
    console.log('getUserDetails');
    return this.userService.getUserProfile();

  }



  navigateToHome() {
    console.log('sign-in navigateToHome:');
    const userRole = this.userDetails.securityRole;
    console.log('userRole: ' + userRole);
    console.log(userRole);
  }

}
