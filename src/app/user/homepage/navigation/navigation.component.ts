import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {UserService} from '../../../shared/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import { EntityUserService } from '../../../entity-store/user/state/entity-user.service';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {AuthService} from '../../../login/auth.service';
import { EntityUserQuery } from '../../../entity-store/user/state/entity-user.query';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {NavigationService} from '../../../shared/navigation.service';
import {NotificationQuery} from '../../../entity-store/notification/state/notification.query';
import {Subject, Subscription} from 'rxjs';
import {NotificationModel} from '../../../entity-store/notification/state/notification.model';
import {take, takeUntil} from 'rxjs/operators';
import {NotificationService} from '../../../shared/notifications/notification.service';
import {EntityCurrentUserModel} from '../../../entity-store/current-user/state/entity-current-user.model';


// We're creating an empty "blackKit" variable to interact with the
// blackKit variable defined in blk-design-system.js
declare var blackKit: any;

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  componentName = 'navigation.component';

  public config: PerfectScrollbarConfigInterface = {};
  private currentUserLoading$ = new Subject();
  private unsubscribe$ = new Subject();
  Notifications;
  NotificationStatus;
  currentUser: EntityCurrentUserModel;
  Detail;
  notificationNums;
  TotalNotificationNums;
  TotalUnReadNotificationNums
  showDetail;
  notifications: NotificationModel[];
  unseenNotifications: NotificationModel[];
  notificationSubscription: Subscription;
  unseenNotificationSubscription: Subscription;
  isCardLoading: boolean;

  constructor(private userService: UserService,
              private router: Router,
              private entityUserQuery: EntityUserQuery,
              private entityCurrentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery,
              private entityUserService: EntityUserService,
              private authService: AuthService,
              private notificationService: NotificationService,
              public notificationQuery: NotificationQuery,
              public navigationService: NavigationService,
  ) { }

  ngOnInit() {
    // Initialize the navbar script
    if ($('.navbar[color-on-scroll]').length !== 0) {
      blackKit.checkScrollForTransparentNavbar();
      $(window).on('scroll', blackKit.checkScrollForTransparentNavbar);
    }
    this.isCardLoading = true;

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
            });
          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });

    // this.notificationService.cacheNotifications().subscribe();
    this.unseenNotificationSubscription = this.notificationQuery.selectAll({
      filterBy: e => e.timeSeen === null
    })
      .subscribe(unseenNotifications => {
        this.unseenNotifications = unseenNotifications;
      });


    this.notificationService.getNotification().subscribe(result => {
      let totalSize = result.length;
      let unReadSize = 0;
      for (let notification of result) {
        if (notification.timeSeen == null) {
          unReadSize++;
        }
      }

      this.TotalNotificationNums = totalSize;
      this.Notifications = result;
      this.TotalUnReadNotificationNums = unReadSize;

      this.Detail = result[0];
      this.showDetail = false;
      if (unReadSize === 0) {
        $('#notification_button').addClass('btn-primary');
      } else {
        $('#notification_button').addClass('btn-danger');
      }
      // console.log('Notification-log Initial' + this.Notifications);
    });
    this.isCardLoading = false;
  }


  close(){
    this.notificationService.getNotification().subscribe(result => {

      //   let size = 0;
      //   let template: Array<number> = new Array<number>();
      //   for (let notification of result) {
      //     if (size < 5) {
      //       if (notification.timeSeen == null) {
      //         size++;
      //         template.push(notification)
      //       }
      //     } else {
      //       break;
      //     }
      //   }

      //   this.Notifications = template;
      //   this.notificationNums = size;

      //   if (size === 0) {
      //     $('#notification_button').removeClass('btn-danger');
      //     if (!$('#notification_button').hasClass('btn-danger')) {
      //       $('#notification_button').addClass('btn-primary');
      //     }
      //   } else {
      //     $('#notification_button').removeClass('btn-primary');
      //   }
    });


  }


  onLogout() {
    this.navigationService.onLogout();
  }

  onStoreClick() {

  }

  onHomeClick() {

    // this.router.navigate(['/user']);
  }


  onClickNotificationDetail(notification){
    const unreadNotificationId = notification.id;
    // let numsofUnread = this.notificationNums;
    // let localNotificationLists = this.notifications;
    // make this notification as unread
    this.Detail  = notification;
    this.notificationService.setNotificationSeenTime(unreadNotificationId).subscribe(result => {
      // console.log("onClickNotificationDetail:" + unreadNotificationId)
      this.notificationService.getNotification().subscribe(result => {

        let totalSize = result.length;
        let unReadSize = 0;
        for (let notification of result) {
          if (notification.timeSeen == null) {
            unReadSize++;
          }
        }

        this.TotalNotificationNums = totalSize;
        this.Notifications = result;
        this.TotalUnReadNotificationNums = unReadSize;

        this.Detail = result[0];
        this.showDetail = false;
        // console.log("onClickNotificationDetail:unReadSize:" + unReadSize)
        if (unReadSize === 0) {
          $('#notification_button').addClass('btn-primary');
        } else {
          $('#notification_button').addClass('btn-danger');
        }
        // console.log('Notification-log Initial' + this.Notifications);
      });
    });

  }

  navigateHome() {
    const functionName = 'navigateHome';
    const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    this.authService.currentUserInfo()
      .then(currentUser => {
        const securityRole = currentUser.attributes['custom:security_role'];
        switch (securityRole) {
          case 'employee': {
            // console.log(`${functionFullName}: navigating to standard-user`);
            this.router.navigate(['/', 'user', 'homepage']);
            break;
          }
          case 'manager': {
            // console.log(`${functionFullName}: navigating to manager-user`);
            this.router.navigate(['/', 'user', 'homepage']);
            break;
          }
          case 'admin': {
            // console.log(`${functionFullName}: navigating to admin-user`);
            this.router.navigate(['/', 'user', 'admin-user']);
            break;
          }
        }
      });

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

  onClickPointItemModal() {
    this.navigationService.openPointItemModal();
  }

  onClickAchievementModal() {
    this.navigationService.openAchievementModal();
  }

  clearPointItemComponentInputUser(event) {
    this.navigationService.pointItemComponentInputUser = null;
  }

  clearAchievementComponentInputUser(event) {
    this.navigationService.achievementComponentInputUser = null;
  }

  clearNotificationDetailComponentInput(event) {
    this.navigationService.notificationDetailsInput = null;
  }

/*  deleteNotification(notification: NotificationModel) {
    console.log(`Deleting notification ${notification.notificationId}`);
    this.notificationService.deleteNotification(notification)
      .pipe(take(1))
      .subscribe(result => {
        console.log(`Notification delete result: `);
        console.log(result);
        this.navigationService.closeNotificationDetailsModal();
      });
  }*/

  ngOnDestroy(): void {
    this.unseenNotificationSubscription.unsubscribe();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
