import { Component, OnInit, ElementRef } from '@angular/core';
import { NotificationService } from 'src/app/shared/notifications/notification.service';
import { Notification } from 'src/app/shared/notifications/notification';
declare var $: any;

@Component({
  selector: 'app-alert-card',
  templateUrl: './alert-card.component.html',
  styleUrls: ['./alert-card.component.css']
})

export class AlertCardComponent implements OnInit {


  alertSize: number;
  Index : number;

  AlertDetail:Object = {
    description: "",
  };
  alert: Array<Object> = new Array<Object>();

  constructor(private notificationService: NotificationService,) { }

  ngOnInit() {
    this.notificationService.getAlert().subscribe(result => {
      let size = 0;
      let alertList = new Array<Object>();
      for (let notification of result){
        alertList.push(notification);
        size++;
      }

      // this.Index = 0;
      if (size > 0) {
        this.AlertDetail = alertList[0];
        this.showAlert();
      }
      this.alert = alertList;
      this.alertSize = size;
      this.Index=0;

      console.log("Alert Size:"+size);
    });
  }

  shownext(notification) {
    // set current notification as readed
    console.log("this.Index" + this.Index)
    this.notificationService.setNotificationSeenTime(notification.id).subscribe(result => {
      this.Index++;
      if (this.Index < this.alertSize) {
        this.AlertDetail = this.alert[this.Index];
      } else {
        $('#alert-button').text("Close");
        if (this.Index > this.alertSize - 1) {
          $('#button_close').click();
        }
      }
    });
  }









  showAlert() {
    $('#alert-modal').click();
  }

}


/*
import {Component, OnInit, ElementRef, OnDestroy} from '@angular/core';
import { Notification } from 'src/app/shared/notifications/notification';
import {NotificationService} from '../../../entity-store/notification/state/notification.service';
import {NotificationQuery} from '../../../entity-store/notification/state/notification.query';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {NotificationModel} from '../../../entity-store/notification/state/notification.model';
import {Subscription} from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-alert-card',
  templateUrl: './alert-card.component.html',
  styleUrls: ['./alert-card.component.css']
})


export class AlertCardComponent implements OnInit, OnDestroy {
  componentName = 'alert-card.component';

  alertSize: number;
  Index : number;

  AlertDetail: any = {
    description: "",
  };
  alert: Array<Object> = new Array<Object>();

  alerts: NotificationModel[];
  alertSubscription: Subscription;
  unseenAlerts: NotificationModel[];
  unseenAlertSubscription: Subscription;
  currentAlert: NotificationModel;

  constructor(private notificationService: NotificationService,
              public notificationQuery: NotificationQuery,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Starting ${functionFullName}`);

/!*    this.userService.cacheUsers().subscribe();
    this.notificationService.cacheNotifications().subscribe();*!/

    this.alertSubscription = this.notificationQuery.selectAll({
      filterBy: e => e.event === 'Alert'
    })
      .subscribe(alerts => {
        console.log(alerts);
        this.alerts = alerts;
      });

    this.unseenAlertSubscription = this.notificationQuery.selectAll({
      filterBy: e => (e.event === 'Alert') && (e.timeSeen === null)
    })
      .subscribe(unseenAlerts => {
        console.log(unseenAlerts);
        this.unseenAlerts = unseenAlerts;
        if (this.unseenAlerts.length > 0) {
          this.currentAlert = this.unseenAlerts[0];
          this.showAlert();
        } else {
          this.currentAlert = null;
          this.closeAlert();
        }
      });

/!*    this.notificationService.getAlerts().subscribe(result => {
       let size = 0;
       let alertList = new Array<Object>();
        for (let notification of result){
           alertList.push(notification);
           size++;
        }

        // this.Index = 0;
       if (size > 0) {
         this.AlertDetail = alertList[0];
          this.showAlert();
        }
        this.alert = alertList;
        this.alertSize = size;
        this.Index=0;

        console.log("Alert Size:"+size);
    });*!/
  }

  showNext(notification) {
    // set current notification as readed
    console.log("this.Index" + this.Index)
    this.notificationService.setNotificationSeenTime(notification.notificationId).subscribe(result => {
        this.Index++;
        if (this.Index < this.alerts.length) {
          this.AlertDetail = this.alert[this.Index];
        } else {
          $('#alert-button').text("Close");
          if (this.Index > this.alertSize - 1) {
            $('#button_close').click();
          }
        }
      });
  }


  showAlert() {
    $('#alertModal').modal('show');
  }

  closeAlert() {
    $('#alertModal').modal('hide');
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
    this.unseenAlertSubscription.unsubscribe();
  }
}
*/
