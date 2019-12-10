import {Component, OnDestroy, OnInit} from '@angular/core';
import {NotificationService} from '../../entity-store/notification/state/notification.service';
import {NotificationQuery} from '../../entity-store/notification/state/notification.query';
import {NotificationModel} from '../../entity-store/notification/state/notification.model';
import {Subscription} from 'rxjs';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {take} from 'rxjs/operators';
import {NavigationService} from '../navigation.service';

declare var $: any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  dataSource: NotificationModel[];
  currentNotificationTab = 'new';
  notificationTabs = [
    'new',
    'all',
  ];

  notifications: NotificationModel[];
  alerts: NotificationModel[];
  notificationsSubscription: Subscription;
  alertsSubscription: Subscription;
  unseenNotifications: NotificationModel[];
  notificationSubscription: Subscription;
  unseenNotificationSubscription: Subscription;

  notificationDetails;
  showDetail = false;
  showLimit = 5;

  constructor(private notificationService: NotificationService,
              public notificationQuery: NotificationQuery,
              private userService: EntityUserService,
              public userQuery: EntityUserQuery,
              private navigationService: NavigationService) { }

  ngOnInit() {
    this.userService.cacheUsers()
      .pipe(take(1))
      .subscribe();

    this.notificationService.cacheNotifications()
      .pipe(take(1))
      .subscribe();

    this.subscription.add(this.notificationQuery.selectAll()
      .subscribe(notifications => {
        this.notifications = notifications;
        if (this.currentNotificationTab === 'all') {
          this.dataSource = this.notifications;
        }
      })
    );

    this.subscription.add(this.notificationQuery.selectAll({
        filterBy: e => e.timeSeen === null
      })
        .subscribe(unseenNotifications => {
          this.unseenNotifications = unseenNotifications;
          if (this.currentNotificationTab === 'new') {
            this.dataSource = this.unseenNotifications;
          }
        })
    );

    this.subscription.add(this.notificationQuery.selectAll({
        filterBy: e => e.event === 'Alert'
      })
        .subscribe(alerts => {
          this.alerts = alerts;
        })
    );

    // this.setNotificationsDataSource('new');
    this.onNotificationTabItemClick('new');
  }

  setNotificationsDataSource(filter) {
    switch (filter) {
      case 'new':
        this.dataSource = this.unseenNotifications;
        break;
      case 'all':
        this.dataSource = this.notifications;
        break;
    }
  }

  onNotificationTabItemClick(clickedItem: string) {
    if (this.currentNotificationTab === clickedItem) {
      // Already there, do nothing.
    } else {
      for (const item of this.notificationTabs) {
        if (item === clickedItem) {
          this.currentNotificationTab = clickedItem;
          document.getElementById(`notificationTab_${item}`).className = document.getElementById(`notificationTab_${item}`).className += ' toggled';
        } else {
          document.getElementById(`notificationTab_${item}`).className = document.getElementById(`notificationTab_${item}`).className.replace('toggled', '').trim();
        }
      }
    }
  }


  openNotificationDetails() {
    this.navigationService.notificationDetailsInput = this.notificationDetails;
    this.navigationService.openNotificationDetailsModal();

  }

/*  updateNotificationButton() {
    if (this.notifications.length === 0) {
      $('#notification_button').removeClass('btn-danger');

      if (!$('#notification_button').hasClass('btn-danger')) {
        $('#notification_button').addClass('btn-primary');
      }
    } else {
      $('#notification_button').removeClass('btn-primary');
    }
  }*/


  onSeenNotificationClick(notification: NotificationModel) {
    console.log('notificationID:' + notification.notificationId);
    this.notificationService.setNotificationSeenTime(notification.notificationId)
      .pipe(take(1))
      .subscribe(result => {
        console.log('onSeenNotificationClick');
        console.log(result);
        /*if (true) {
          // tslint:disable-next-line:no-shadowed-variable
          this.notificationService.getNotifications().subscribe(result => {
            if (result === '') {
              $('#notification_button').removeClass('btn-danger');
              if (!$('#notification_button').hasClass('btn-danger')) {
                $('#notification_button').addClass('btn-primary');
              }
            } else {
              $('#notification_button').removeClass('btn-primary');
            }
            this.Notifications = result;
          });
        }*/
      });
  }


  onClickNotificationDetails(notification: NotificationModel) {

    this.notificationDetails = notification;
    if (notification.timeSeen === null) {
      this.notificationService.setNotificationSeenTime(notification.notificationId)
        .pipe(take(1))
        .subscribe(result => {
          console.log('onSeenNotificationClick');
          console.log(result);
        });
    }
  }

  deleteNotification(notification: NotificationModel) {
    console.log('deleting notification:');
    console.log(notification);
  }

  showMore() {
    this.showLimit += 5;
  }

  close() {

/*    this.notificationService.getNotifications().subscribe(result => {

      let size = 0;
      let template: Array<number> = new Array<number>();
      for (let notification of result) {
        if (size < 5) {
          if (notification.timeSeen == null) {
            size++;
            template.push(notification)
          }
        } else {
          break;
        }
      }

      this.Notifications = template;
      this.notificationNums = size;

      if (size === 0) {
        $('#notification_button').removeClass('btn-danger');
        if (!$('#notification_button').hasClass('btn-danger')) {
          $('#notification_button').addClass('btn-primary');
        }
      } else {
        $('#notification_button').removeClass('btn-primary');
      }
    });*/


  }


  timeago(dateTimeStamp) {
    var result;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    console.log(now)
    var diffValue = now - dateTimeStamp;

    if (diffValue < 0) {
      return;
    }
    var minC = diffValue / minute;
    var hourC = diffValue / hour;
    var dayC = diffValue / day;
    var weekC = diffValue / week;
    var monthC = diffValue / month;
    if (monthC >= 1 && monthC <= 3) {
      result = " " + 1 + "月前"
    } else if (weekC >= 1 && weekC <= 3) {
      result = " " + 1 + "周前"
    } else if (dayC >= 1 && dayC <= 6) {
      result = " " + 1 + "天前"
    } else if (hourC >= 1 && hourC <= 23) {
      result = " " + 1 + "小时前"
    } else if (minC >= 1 && minC <= 59) {
      result = " " + 1 + "分钟前"
    } else if (diffValue >= 0 && diffValue <= minute) {
      result = "刚刚"
    } else {
      var datetime = new Date();
      datetime.setTime(dateTimeStamp);
      var Nyear = datetime.getFullYear();
      var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
      var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
      var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
      var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
      var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
      result = Nyear + "-" + Nmonth + "-" + Ndate
    }
    console.log("Notification:TimeAgo"+result);
    return result;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
