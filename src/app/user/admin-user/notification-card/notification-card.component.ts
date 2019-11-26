import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/shared/notifications/notification.service';


@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.css']
})
export class NotificationCardComponent implements OnInit {

  userForm = new FormGroup({
    title: new FormControl(),
    content: new FormControl()
  }); 
  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
  }

  sendNotification(){
      console.log(this.userForm.value)
      
  }

}
