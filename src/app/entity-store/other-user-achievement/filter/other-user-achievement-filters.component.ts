import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { OtherUserAchievementFilterModel, VISIBILITY_FILTER } from './other-user-achievement-filter.model';
import { FormControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';
import {NotificationService} from '../../../shared/notifications/notification.service';

@Component({
  selector: 'app-achievement-filters',
  templateUrl: './other-user-achievement-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherUserAchievementFiltersComponent implements OnInit, OnDestroy {
  @Input() active: VISIBILITY_FILTER;
  @Input() filters: OtherUserAchievementFilterModel[];
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
