import { Injectable } from '@angular/core';
import { CurrentUserState, CurrentUserStore } from './current-user.store';
import { EntityCurrentUserModel } from './entity-current-user.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/current-user-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntityCurrentUserQuery extends QueryEntity<CurrentUserState, EntityCurrentUserModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleUserAvatars$ = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleUser
  );


  constructor(protected store: CurrentUserStore) {
    super(store);
  }


  private getVisibleUser(filter, userAvatars): EntityCurrentUserModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return userAvatars.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return userAvatars.filter(t => !t.completed);
      default:
        return userAvatars;
    }
  }

  // public getUser(username: string): EntityUserAvatarModel {
  public getCurrentUserAvatar() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }

  public getCurrentUser() {
    return this.selectAll();
  }

  public getCurrentUserPointsPool() {
    return this.getAll()[0].pointsPool;
  }
}
