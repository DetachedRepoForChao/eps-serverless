import { Injectable } from '@angular/core';
import { UserAvatarState, UserAvatarStore } from './user-avatar.store';
import { EntityUserAvatarModel } from './entity-user-avatar.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/user-avatar-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntityUserAvatarQuery extends QueryEntity<UserAvatarState, EntityUserAvatarModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleUserAvatars$ = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleUserAvatars
  );


  constructor(protected store: UserAvatarStore) {
    super(store);
  }


  private getVisibleUserAvatars(filter, userAvatars): EntityUserAvatarModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return userAvatars.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return userAvatars.filter(t => !t.completed);
      default:
        return userAvatars;
    }
  }

  // public getUserAvatar(username: string): EntityUserAvatarModel {
  public getUserAvatar(username: string) {
    const userAvatar = this.getAll({
      filterBy: avatarEntity => avatarEntity.username === username
    });
    // const avatars = this.getAll();
    // const avatar = this.getEntity(username);

    // console.log(userAvatar);
    // console.log(this.getAll());
    return userAvatar;
  }
}
