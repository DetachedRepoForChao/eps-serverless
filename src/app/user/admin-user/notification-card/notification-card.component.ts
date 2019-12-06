import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DepartmentService } from 'src/app/shared/department.service';
import { tap } from 'rxjs/operators';
import { Department } from '../../../shared/department.model';
import {forkJoin, Observable, Subscription} from 'rxjs';
import { EntityUserService } from 'src/app/entity-store/user/state/entity-user.service';
import { Notification } from 'src/app/shared/notifications/notification';
import { NotifierService } from 'angular-notifier';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {NotificationService} from '../../../entity-store/notification/state/notification.service';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';

declare var $: any;
@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.css']
})


export class NotificationCardComponent implements OnInit, OnDestroy {

  public config: PerfectScrollbarConfigInterface = {};

  notificationForm = new FormGroup({
    title: new FormControl(),
    content: new FormControl(),
    department: new FormControl(),
    alertFlag: new FormControl(),
    user: new FormControl(),
  });

  notification: any = {};

  departments;
  users: EntityUserModel[];
  userSubscription: Subscription;

  audience = 'department';

  constructor(private notificationService: NotificationService,
              private departmentService: DepartmentService,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private notifierService: NotifierService) { }

  ngOnInit() {
    this.userService.cacheUsers().subscribe();
    // Read in the list of departments from the DepartmentService
    this.departmentService.getDepartments().subscribe(data => {
      this.departments = data;
    });

    this.userSubscription = this.userQuery.selectAll()
      .subscribe(users => {
        this.users = users;
      }) ;
  }



  sendNotification() {
    console.log(this.notificationForm);
    this.notification['title'] = this.notificationForm.value['title'];
    this.notification['description'] = this.notificationForm.value['content'];

    switch (this.audience) {
      case 'department':
        this.notification['departmentId'] = this.notificationForm.value.department;
        this.notification['audience'] = 'department';

        break;
      case 'individual':
        this.notification['targetUserId'] = this.notificationForm.value.user;
        this.notification['audience'] = 'individual';
        break;
    }


    if (this.notificationForm.value['alertFlag']) {
      this.notification['event'] = 'Alert';
    } else {
      this.notification['event'] = 'Notification';
    }
    this.notification['status'] = '1';
    this.notificationService.sendNotification(this.notification).subscribe(result => {
      console.log(result);
      if (result.status !== false) {
        this.notifierService.notify('success',"Success Send Notification");
        $('#close_modal').click();
      } else {
        this.notifierService.notify('error', "Fail to set Notification");
      }
    });
  }

  audienceToggle(audience) {
    this.audience = audience;
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
