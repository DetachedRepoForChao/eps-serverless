import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UserFilterModel, VISIBILITY_FILTER } from './user-filter.model';
import { FormControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-user-avatar-filters',
  templateUrl: './user-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFiltersComponent implements OnInit, OnDestroy {
  @Input() active: VISIBILITY_FILTER;
  @Input() filters: UserFilterModel[];
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
