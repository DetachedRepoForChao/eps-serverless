import { Component, OnInit, ElementRef } from '@angular/core';
import { NotificationService } from 'src/app/shared/notifications/notification.service';
import { Notification } from 'src/app/shared/notifications/notification';
declare var $: any;

@Component({
  selector: 'app-alert-card',
  templateUrl: './alert-card.component.html',
  styleUrls: ['./alert-card.component.css']
})

export class AlertCardComponent implements OnInit {

  
  alertSize: number;
  Index : number;

  AlertDetail:Object = {
    description: "",
  };
  alert: Array<Object> = new Array<Object>();

  constructor(private notificationService: NotificationService,) { }

  ngOnInit() {
    this.notificationService.getAlert().subscribe(result => {
       let size = 0;
       let alertList = new Array<Object>();
        for (let notification of result){
           alertList.push(notification);
           size++;
        }
       
        // this.Index = 0;
       if (size > 0) {
         this.AlertDetail = alertList[0];
          this.showAlert();
        }
        this.alert = alertList;
        this.alertSize = size;
        this.Index=0; 

        console.log("Alert Size:"+size);
    });
  }

  shownext(notification) {
    // set current notification as readed
    console.log("this.Index" + this.Index)
    this.notificationService.setNotificationSeenTime(notification.id).subscribe(result => {
        this.Index++;
        if (this.Index < this.alertSize) {
          this.AlertDetail = this.alert[this.Index];
        } else {
          $('#alert-button').text("Close");
          if (this.Index > this.alertSize - 1) {
            $('#button_close').click();
          }
        }
      });
  }
   
   
     
    

  
      
  

  showAlert() {
    $('#alert-modal').click();
  }

}
