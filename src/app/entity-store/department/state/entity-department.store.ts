import { EntityDepartmentModel } from './entity-department.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/department-filter.model';
import {Injectable} from '@angular/core';

export interface EntityDepartmentState extends EntityState<EntityDepartmentModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'EntityDepartmentStore'})
@Injectable({
  providedIn: 'root'
})
export class EntityDepartmentStore extends EntityStore<EntityDepartmentState,EntityDepartmentModel>{
  constructor(){
    super(initialState);
  }
}

