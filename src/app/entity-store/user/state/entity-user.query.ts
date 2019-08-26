import { Injectable } from '@angular/core';
import { UserState, UserStore } from './user.store';
import { EntityUserModel } from './entity-user.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/user-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntityUserQuery extends QueryEntity<UserState, EntityUserModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleUserAvatars$ = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleUser
  );


  constructor(protected store: UserStore) {
    super(store);
  }


  private getVisibleUser(filter, userAvatars): EntityUserModel[] {
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
  public getCurrentUserAvatar() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }
}
