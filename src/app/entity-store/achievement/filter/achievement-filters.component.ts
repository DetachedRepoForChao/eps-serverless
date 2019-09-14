import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AchievementFilterModel, VISIBILITY_FILTER } from './achievement-filter.model';
import { FormControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-achievement-filters',
  templateUrl: './achievement-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementFiltersComponent implements OnInit, OnDestroy {
  @Input() active: VISIBILITY_FILTER;
  @Input() filters: AchievementFilterModel[];
  @Output() update = new EventEmitter<VISIBILITY_FILTER>();

  control: FormControl;

  ngOnInit() {
    this.control = new FormControl(this.active);

    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe(c => {
      this.update.emit(c);
    });
  }

  ngOnDestroy(): void {}
}
