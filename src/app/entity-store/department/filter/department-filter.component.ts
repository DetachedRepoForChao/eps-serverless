import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DepartmentFilterModel, VISIBILITY_FILTER } from './department-filter.model';
import { FormControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-department-filters',
  templateUrl: './department-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentFilterComponent implements OnInit, OnDestroy {
  @Input() active: VISIBILITY_FILTER;
  @Input() filters: DepartmentFilterModel[];
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
