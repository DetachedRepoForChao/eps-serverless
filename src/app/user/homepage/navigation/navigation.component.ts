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

  constructor(private userService: UserService,
              private globalVariableService: GlobalVariableService,
              private router: Router,
              private feedcardService: FeedcardService,
              private achievementService: AchievementService,
              private entityUserAvatarService: EntityUserService,
              private entityUserService: EntityCurrentUserService,
              private storeItemService: StoreItemService,
              private auth: AuthService) { }

  ngOnInit() {
    // Initialize the navbar script
    if ($('.navbar[color-on-scroll]').length !== 0) {
      blackKit.checkScrollForTransparentNavbar();
      $(window).on('scroll', blackKit.checkScrollForTransparentNavbar);
    }
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
    this.auth.signOut();
    resetStores();
    this.router.navigate(['/login']);

  }

  onStoreClick() {

  }

  onHomeClick() {

    // this.router.navigate(['/user']);
  }

}
