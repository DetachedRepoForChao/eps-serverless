import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../shared/user.service';
import {Router} from '@angular/router';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {resetStores} from '@datorama/akita';
import {AuthService} from '../../../login/auth.service';

import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {NotificationService} from '../../../shared/notifications/notification.service';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
// import {NotificationService} from '../../../entity-store/notification/state/entity-notification.service';


// We're creating an empty "blackKit" variable to interact with the
// blackKit variable defined in blk-design-system.js
declare var blackKit: any;

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  componentName = 'navigation.component';

  public config: PerfectScrollbarConfigInterface = {};
  Notifications;
  NotificationStatus;
  currentUser$;
  Detail;
  notificationNums;
  showDetail;

  constructor(private userService: UserService,
              private router: Router,
              private feedcardService: FeedcardService,
              private achievementService: AchievementService,
              private entityUserAvatarService: EntityUserService,
              private entityCurrentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery,
              private storeItemService: StoreItemService,
              private authService: AuthService,
              private notificationService: NotificationService,
              ) { }

  ngOnInit() {

    // Initialize the navbar script
    if ($('.navbar[color-on-scroll]').length !== 0) {
      blackKit.checkScrollForTransparentNavbar();
      $(window).on('scroll', blackKit.checkScrollForTransparentNavbar);
    }

    this.entityCurrentUserService.cacheCurrentUser().subscribe();
    this.currentUser$ = this.currentUserQuery.selectAll();

    this.notificationService.getNotification().subscribe(result => {
      let size = 0;
      let template: Array<number> = new Array<number>();
      for (let notification of result){
        if(size<5){
          if (notification.timeSeen == null) {
            size++;
            template.push(notification)
          }
        }else{
          break;
        }
      }
      this.Detail  = template[0];
      this.Notifications = template;
      this.notificationNums = size;
      this.showDetail = false;
      if (result === '') {
        $('#notification_button').addClass('btn-primary');
      } else {
        $('#notification_button').addClass('btn-danger');
      }
      console.log('Notification-log Initial' + this.Notifications);
    });

  }

  onShowAll(){
    this.notificationService.getNotification().subscribe(result => {
      let size = this.notificationNums+5;
      size = Math.min(size,result.length);
      this.Notifications = result.slice(0,size);
      console.log('Notification-log Initial' + this.Notifications);
      this.notificationNums = size;
    });
  }

  close(){

    this.notificationService.getNotification().subscribe(result => {

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
    });


  }

  onLogout() {
    this.feedcardService.clearPointTransactionCache();
    this.achievementService.incrementAchievement('SignOut').subscribe();
    this.authService.signOut().then();
    resetStores();
    this.router.navigate(['/login']).then();
  }

  onStoreClick() {

  }

  onHomeClick() {

    // this.router.navigate(['/user']);
  }

  onSeenNotificationClick(notification) {
    console.log('notificationID:' + notification.id);
    this.notificationService.setNotificationSeenTime(notification.id).subscribe(result => {
       console.log('onSeenNotificationClick');
       if (true) {
         // tslint:disable-next-line:no-shadowed-variable
         this.notificationService.getNotification().subscribe(result => {
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
       }
     });
  }


  onClickNotificationDetail(notification){
    let numsofUnread = this.notificationNums;
        console.log('onClickNotificationDetail:' + notification.id);
        if(notification.timeSeen==null){
          this.notificationService.setNotificationSeenTime(notification.id).subscribe(result => {
            console.log('onSeenNotificationClick');
            if (true) {
              numsofUnread-=1;
              this.notificationNums = numsofUnread;
            }
          });
        }
        let id = notification.id;
        for (let temp of this.Notifications){
          if(temp.id === id){
                this.Detail = temp;
                console.log('onClickNotificationDetail:' + notification.id);
          }
        }
  }

  navigateHome() {
    const functionName = 'navigateHome';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.authService.currentUserInfo()
      .then(currentUser => {
        const securityRole = currentUser.attributes['custom:security_role'];
        switch (securityRole) {
          case 'employee': {
            console.log(`${functionFullName}: navigating to standard-user`);
            // this.router.navigate(['standard-user']);
            console.log(this.router);
            console.log(this.router.getCurrentNavigation());
            // console.log(this.router.)
            this.router.navigate(['user', 'homepage']);
            // this.router.navigate([{ outlets: { 'user-page': ['user/homepage']}}]);
            break;
          }
          case 'manager': {
            console.log(`${functionFullName}: navigating to manager-user`);
            // this.router.navigate(['manager-user']);
            this.router.navigate(['user', 'homepage']);
            // this.router.navigate([{ outlets: { 'user-page': ['homepage']}}]);
            break;
          }
          case 'admin': {
            console.log(`${functionFullName}: navigating to admin-user`);
            this.router.navigate(['user', 'admin-user']);
            // this.router.navigate([{ outlets: { 'user-page': ['admin-user']}}]);
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

}
