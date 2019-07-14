import { Component, OnInit } from '@angular/core';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({
  selector: 'app-twitter-card',
  templateUrl: './twitter-card.component.html',
  styleUrls: ['./twitter-card.component.css']
})
export class TwitterCardComponent implements OnInit {

  constructor(
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document
  ) {
  }

  ngOnInit() {
    // const s = this.renderer2.createElement('script');
    // s.type = 'text/javascript';
    // s.src = 'https://platform.twitter.com/widgets.js' ;
    // s.text = ``;
    // this.renderer2.appendChild(this._document.body, s);
  }
  
  
}
