import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FeedcardFilterModel, VISIBILITY_FILTER } from './feedcard-filter.model';
import { FormControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';
import {NotificationService} from '../../../shared/notifications/notification.service';

@Component({
  selector: 'app-feedcard-filter',
  templateUrl: './feedcard-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedcardFiltersComponent implements OnInit, OnDestroy {
  @Input() active: VISIBILITY_FILTER;
  @Input() filters: FeedcardFilterModel[];
  @Output() update = new EventEmitter<VISIBILITY_FILTER>();

  control: FormControl;

  constructor(private notificationService: NotificationService, ) {

  }

  ngOnInit() {
    this.control = new FormControl(this.active);

    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe(c => {
      this.update.emit(c);
    });
  }

  ngOnDestroy(): void {}
}
