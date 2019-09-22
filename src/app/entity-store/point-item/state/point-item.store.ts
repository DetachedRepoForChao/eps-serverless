import { PointItemModel } from './point-item.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/point-item-filter.model';
import {Injectable} from '@angular/core';

export interface PointItemState extends EntityState<PointItemModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'pointItemStore'})
@Injectable({
  providedIn: 'root'
})
export class PointItemStore extends EntityStore<PointItemState, PointItemModel> {
  constructor() {
    super(initialState);
  }
}
