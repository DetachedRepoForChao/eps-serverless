import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EntityUserAvatarModel } from './state/entity-user-avatar.model';
import { FormControl } from '@angular/forms';
import { ID } from '@datorama/akita';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-user-avatar',
  template: `
    <div class="flex align-center sb">
     <div class="flex">
      <label>
        <input type="checkbox" [formControl]="control"/>
        <span></span>
      </label>
      <img src="{{userAvatar.avatarResolvedUrl}}">
    </div>
    <a class="btn waves-effect waves-light red btn-small btn-floating">
      <i class="material-icons" (click)="delete.emit(userAvatar.id)">delete_forever</i>
    </a>

   </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAvatarComponent implements OnInit, OnDestroy {
  @Input() userAvatar: EntityUserAvatarModel;
  @Output() complete = new EventEmitter<EntityUserAvatarModel>();
  @Output() delete = new EventEmitter<ID>();

  control: FormControl;

  ngOnInit() {
    this.control = new FormControl(this.userAvatar.dateModified);

    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe((dateModified: any) => {
      this.complete.emit({ ...this.userAvatar, dateModified });
    });
  }

  ngOnDestroy(): void { }
}
