import { Component, OnInit } from '@angular/core';
import {SocketService} from '../../shared/socket.service';
import {NotifierService} from 'angular-notifier';
import {Globals} from '../../globals';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  // styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  globalService;

  constructor(
    private socketService: SocketService,
    private notifierService: NotifierService,
    public globals: Globals) { }

  ngOnInit() {
    this.globalService = this.globals;
    // if (this.socketService.onSessionCreate() != null) {
    //  console.log(this.socketService.onSessionCreate());
    //  this.notifierService.notify('success', 'Session created!');
    // }
  }

}