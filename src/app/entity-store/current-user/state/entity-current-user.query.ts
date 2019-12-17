import { Injectable } from '@angular/core';
import { CurrentUserState, CurrentUserStore } from './current-user.store';
import { EntityCurrentUserModel } from './entity-current-user.model';
import { QueryEntity } from '@datorama/akita';
import {combineLatest, Observable} from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/current-user-filter.model';
import {map, take} from 'rxjs/operators';
import {StoreItemQuery} from '../../store-item/state/store-item.query';
import {UserHasStoreItemQuery} from '../../user-has-store-item/state/user-has-store-item.query';

@Injectable({
  providedIn: 'root'
})
export class EntityCurrentUserQuery extends QueryEntity<CurrentUserState, EntityCurrentUserModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleUsers$ = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleUser
  );


  constructor(protected store: CurrentUserStore,
              private storeItemQuery: StoreItemQuery,
              private userHasStoreItemQuery: UserHasStoreItemQuery) {
    super(store);
  }


  private getVisibleUser(filter, users): EntityCurrentUserModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return users.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return users.filter(t => !t.completed);
      default:
        return users;
    }
  }

  public getCurrentUser() {
    return this.getAll()[0];
  }

  public selectCurrentUser(): Observable<EntityCurrentUserModel> {
    return new Observable<EntityCurrentUserModel>(observer => {

      this.selectAll()
        .subscribe((currentUser: EntityCurrentUserModel[]) => {
          // console.log('current user emitting value');
          observer.next(currentUser[0]);
          // observer.complete();
        });
    });
  }

  public getCurrentUserPointsPool() {
    return this.getAll()[0].pointsPool;
  }


}
