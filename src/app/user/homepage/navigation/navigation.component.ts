import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../shared/user.service';
import {GlobalVariableService} from '../../../shared/global-variable.service';
import {Router} from '@angular/router';
import {FeedcardService} from '../../../shared/feedcard/feedcard.service';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityCurrentUserService} from '../../../entity-store/current-user/state/entity-current-user.service';
import {StoreItemService} from '../../../entity-store/store-item/state/store-item.service';
import {resetStores} from '@datorama/akita';
import {AuthService} from '../../../login/auth.service';
import { NotificationService } from 'src/app/shared/notifications/notification.service';
import { Globals } from 'src/app/globals';
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

  Notifications;
  NotificationStatus;
  constructor(private userService: UserService,
              private globalVariableService: GlobalVariableService,
              private router: Router,
              private feedcardService: FeedcardService,
              private achievementService: AchievementService,
              private entityUserAvatarService: EntityUserService,
              private entityUserService: EntityCurrentUserService,
              private storeItemService: StoreItemService,
              private auth: AuthService,
              private notificationService: NotificationService,
              private globals: Globals
              ) { }

  ngOnInit() {
    
    // Initialize the navbar script
    if ($('.navbar[color-on-scroll]').length !== 0) {
      blackKit.checkScrollForTransparentNavbar();
      $(window).on('scroll', blackKit.checkScrollForTransparentNavbar);
    }
    const targetUserID = this.globals.getUsername();
    this.notificationService.getNotification().subscribe(result => {
      this.Notifications = result;
      if(result==''){
        $('#notification_button').addClass('btn-primary');
      }else{
        $('#notification_button').addClass('btn-danger');
      }
      console.log("Notification-log click!!!!!!!!!!!!!!!!!!" + this.Notifications);
    });

  }

  onLogout() {
    // this.userService.deleteToken();
    // this.globalVariableService.resetAllVariables();
    this.feedcardService.clearPointTransactionCache();
    // localStorage.clear();
/*    this.achievementService.reset();
    this.entityUserService.reset();
    this.entityUserAvatarService.reset();
    this.storeItemService.reset();*/
    this.achievementService.incrementAchievement('SignOut').subscribe();
    this.auth.signOut();
    resetStores();
    this.router.navigate(['/login']);

  }

  onStoreClick() {

  }

  onHomeClick() {

    // this.router.navigate(['/user']);
  }

  onSeenNotificationClick(notification){
    console.log("notificationID:" + notification.id);
    this.notificationService.setNotificationSeenTime(notification.id).subscribe(result =>{
       console.log("onSeenNotificationClick"+result);
     })
  }

  navigateHome() {
    const functionName = 'navigateHome';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    switch (this.globals.getUserAttribute('custom:security_role')) {
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
  }

}
