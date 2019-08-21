import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EntityUserAvatarModel } from './state/entity-user-avatar.model';
import { ID } from '@datorama/akita';

@Component({
  selector: 'app-user-avatars',
  template: `
    <div class="collection with-header">
      <h4 class="collection-header">UserAvatars:</h4>
      <app-user-avatar *ngFor="let userAvatar of userAvatars; trackBy: trackByFn"
                class="collection-item"
                (delete)="delete.emit($event)"
                (complete)="complete.emit($event)"
                [userAvatar]="userAvatar"></app-user-avatar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAvatarsComponent {
  @Input() userAvatars: EntityUserAvatarModel[];
  @Output() complete = new EventEmitter<EntityUserAvatarModel>();
  @Output() delete = new EventEmitter<ID>();

  trackByFn(index, userAvatar) {
    return userAvatar.id;
  }
}
