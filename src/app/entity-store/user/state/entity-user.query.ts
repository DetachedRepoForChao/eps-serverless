import { Injectable } from '@angular/core';
import { UserState, UserStore } from './user.store';
import { EntityUserModel } from './entity-user.model';
import {QueryConfig, QueryEntity, Order} from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/user-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
@QueryConfig({
  sortBy: 'points',
  sortByOrder: Order.DESC // Order.ASC
})
export class EntityUserQuery extends QueryEntity<UserState, EntityUserModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleUsers$ = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleUsers
  );


  constructor(protected store: UserStore) {
    super(store);
  }


  private getVisibleUsers(filter, users): EntityUserModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return users.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return users.filter(t => !t.completed);
      default:
        return users;
    }
  }

  // public getUser(username: string): EntityUserAvatarModel {
  public getUser(username: string) {
    const user$ = this.selectAll({
      filterBy: userEntity => userEntity.username === username
    });
    // const avatars = this.getAll();
    // const avatar = this.getEntity(username);

    // console.log(userAvatar);
    // console.log(this.getAll());
    return user$;
  }



  public getDeactivatedUsers() {
    return this.selectAll({
      filterBy: userEntity => !(userEntity.active)
    });
  }

  public getUserCompleteAchievementCount(userId: number) {
    const user = this.getAll({
      filterBy: x => x.userId === userId
    })[0];

    const numArray = Array(user.completeAchievementsTotal).map((x, i) => i);
    // console.log(numArray);
    return numArray;
  }

  public getDepartmentManager(departmentId: number) {
    const manager = this.getAll({
      filterBy: userEntity => (userEntity.department.Id === departmentId) && (userEntity.securityRole.Id === 2),
    });

    return manager;
  }
}
