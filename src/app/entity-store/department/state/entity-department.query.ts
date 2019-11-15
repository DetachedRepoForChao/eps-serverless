import { Injectable } from '@angular/core';
import { EntityDepartmentState, EntityDepartmentStore } from './entity-department.store';
import { EntityDepartmentModel } from './entity-department.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/department-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntityDepartmentQuery extends QueryEntity<EntityDepartmentState, EntityDepartmentModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleFeatures = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleEntityDepartment
  );


  constructor(protected store: EntityDepartmentStore) {
    super(store);
  }


  private getVisibleEntityDepartment(filter, department): EntityDepartmentModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return department.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return department.filter(t => !t.completed);
      default:
        return department;
    }
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
