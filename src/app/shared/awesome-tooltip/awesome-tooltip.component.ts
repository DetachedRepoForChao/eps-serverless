import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-awesome-tooltip',
  templateUrl: './awesome-tooltip.component.html',
  styleUrls: ['./awesome-tooltip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class AwesomeTooltipComponent implements OnInit {
  @Input() object = null;

  constructor() { }

  ngOnInit() {
  }

}
