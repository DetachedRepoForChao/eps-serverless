import { Component, OnInit, ElementRef } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-alert-card',
  templateUrl: './alert-card.component.html',
  styleUrls: ['./alert-card.component.css']
})

export class AlertCardComponent implements OnInit {


  Index : number;
  alert : string[];
  showContent : String;

  constructor() { }

  ngOnInit() {
    this.alert = ["asdasdfasdfasdf", "sadfasdfasdfas"];
    this.showAlert();
  }

  shownext() {
    this.Index++;    
    if (this.Index < this.alert.length){
      this.showContent = this.alert[this.Index];
    }
    console.log("showContent"+this.showContent);
  }

  showAlert() {
    this.Index = 0;
    
    this.showContent = this.alert[this.Index];
    $('#alert-modal').click();
  }
}
