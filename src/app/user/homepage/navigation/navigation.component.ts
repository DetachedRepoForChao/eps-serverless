import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../shared/user.service';
import {GlobalVariableService} from '../../../shared/global-variable.service';
import {Router} from '@angular/router';

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
              private router: Router) { }

  ngOnInit() {
    // Initialize the navbar script
    if ($('.navbar[color-on-scroll]').length !== 0) {
      blackKit.checkScrollForTransparentNavbar();
      $(window).on('scroll', blackKit.checkScrollForTransparentNavbar);
    }
  }

  onLogout() {
    this.userService.deleteToken();
    this.globalVariableService.resetAllVariables();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
