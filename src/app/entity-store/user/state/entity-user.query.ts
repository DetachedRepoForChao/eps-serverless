import { Injectable } from '@angular/core';
import { UserState, UserStore } from './user.store';
import { EntityUserModel } from './entity-user.model';
import {QueryConfig, QueryEntity, Order} from '@datorama/akita';
import {combineLatest, Observable} from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/user-filter.model';
import {map, take} from 'rxjs/operators';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';
import {NotificationModel} from '../../notification/state/notification.model';

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
  public selectUser(username: string) {
    const user$ = this.selectAll({
      filterBy: userEntity => userEntity.username === username
    });
    // const avatars = this.getAll();
    // const avatar = this.getEntity(username);

    // console.log(userAvatar);
    // console.log(this.getAll());
    return user$;
  }

  public getUserByUsername(username: string) {
    return this.getAll({
      filterBy: e => e.username === username
    })[0];
  }

  public getUserByUserId(userId: number) {
    return this.getAll({
      filterBy: e => e.userId === userId
    })[0];
  }

  public selectUserByUserId(userId: number): Observable<EntityUserModel> {
    return new Observable<EntityUserModel>(observer => {
      this.selectAll({
        filterBy: e => e.userId === userId
      })
        .pipe(take(1))
        .subscribe((user: EntityUserModel[]) => {
          observer.next(user[0]);
          observer.complete();
        });
    });
  }

  public selectUserByUsername(username: string): Observable<EntityUserModel> {
    return new Observable<EntityUserModel>(observer => {
      this.selectAll({
        filterBy: e => e.username === username
      })
        .pipe(take(1))
        .subscribe((user: EntityUserModel[]) => {
          observer.next(user[0]);
          observer.complete();
        });
    });
  }

  public selectAdminUsers() {
    return this.selectAll({
      filterBy: e => e.securityRole.Id === 3
    });
  }

  public selectDeactivatedUsers() {
    return this.selectAll({
      filterBy: e => !(e.active)
    });
  }


  public getDeactivatedUsers() {
    return this.getAll({
      filterBy: e => !(e.active)
    });
  }

  public getUserCompleteAchievementCount(userId: number) {
    const user = this.getAll({
      filterBy: x => x.userId === userId
    })[0];

    return Array(user.completeAchievementsTotal).map((x, i) => i);
  }

  public selectUserCompleteAchievementCount(userId: number): Observable<any> {
    return new Observable<any>(observer => {
      this.selectAll({
        filterBy: x => x.userId === userId
      })
        .subscribe(user => {

          const numArray = Array(user[0].completeAchievementsTotal).map((x, i) => i);
          observer.next(numArray);
          observer.complete();
        });
    });
  }

  public getDepartmentManager(departmentId: number) {
    const manager = this.getAll({
      filterBy: userEntity => (userEntity.department.Id === departmentId) && (userEntity.securityRole.Id === 2),
    });

    return manager;
  }


}
