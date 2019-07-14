import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
    // Initialize the navbar script
    if ($('.navbar[color-on-scroll]').length !== 0) {
      blackKit.checkScrollForTransparentNavbar();
      $(window).on('scroll', blackKit.checkScrollForTransparentNavbar);
    }
  }

}
