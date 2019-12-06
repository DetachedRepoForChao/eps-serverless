import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/shared/notifications/notification.service';
import { DepartmentService } from 'src/app/shared/department.service';
import { tap } from 'rxjs/operators';
import { Department } from '../../../shared/department.model';
import { forkJoin, Observable } from 'rxjs';
import { EntityUserService } from 'src/app/entity-store/user/state/entity-user.service';
import { Notification } from 'src/app/shared/notifications/notification';
import { NotifierService } from 'angular-notifier';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';

declare var $: any;
@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.css']
})


export class NotificationCardComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {};

  userForm = new FormGroup({
    title: new FormControl(),
    content: new FormControl(),
    department: new FormControl(),
  });
  notification = new Notification();

  departments;

  constructor(private notificationService: NotificationService,
                  private departmentService: DepartmentService,
                 private userService: EntityUserService,
                  private notifierService: NotifierService,) { }

  ngOnInit() {
    this.userService.cacheUsers().subscribe();
    // Read in the list of departments from the DepartmentService
    this.departmentService.getDepartments().subscribe(data => {
      this.departments = data;
    })
  }

  sendNotification(){
     this.notification.title = this.userForm.value['title'];
     this.notification.description = this.userForm.value['content'];
     this.notification.groupId = this.userForm.value['department'];
     this.notification.event = 'Alert'
     this.notification.status = '1';
     this.notificationService.setNotificationToGroup(this.notification).subscribe(result => {
        if (result.status==200){
            this.notifierService.notify('success',"Success Send Notification");
            $('#close_modal').click();
        }else {
            this.notifierService.notify('error', "Fail to set Notification");
        }
     });
  }

}
