import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificationModel} from '../../entity-store/notification/state/notification.model';
import {NavigationService} from '../navigation.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {take} from 'rxjs/operators';
import {NotificationService} from '../../entity-store/notification/state/notification.service';
import {EntityDepartmentQuery} from '../../entity-store/department/state/entity-department.query';

declare var $: any;

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.css']
})
export class NotificationDetailsComponent implements OnInit {
  @Input() inputNotification: NotificationModel;
  @Output() clearInputNotification = new EventEmitter<any>();

  notificationToDelete: NotificationModel;

  constructor(private navigationService: NavigationService,
              private userQuery: EntityUserQuery,
              private notificationService: NotificationService,
              public departmentQuery: EntityDepartmentQuery) { }

  ngOnInit() {


    const parentScope = this;
    $('#notificationDetailsModal').on('hidden.bs.modal',
      function (e) {
        // console.log('running on hidden function');
        // console.log(e);
        // parentScope.inputUser = null;
        // parentScope.navigationService.pointItemComponentInputUser = null;
        parentScope.clearInputNotification.emit(true);
        parentScope.navigationService.pointItemModalActive = false;
      });
  }

  deleteNotification(notification: NotificationModel) {
    // console.log(`Deleting notification ${notification.notificationId}`);
    this.notificationService.deleteNotification(notification)
      .pipe(take(1))
      .subscribe(result => {
        // console.log(`Notification delete result: `);
        // console.log(result);
      });
  }

  notificationDeleteToggle(notification: NotificationModel) {
    if (this.notificationToDelete === notification) {
      this.notificationToDelete = null;
      return;
    }
    this.notificationToDelete = notification;
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
    // console.log(now)
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
    // console.log("Notification:TimeAgo"+result);
    return result;
  }
}
