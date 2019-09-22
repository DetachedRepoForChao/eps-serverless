import { StoreItemModel } from './store-item.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/store-item-filter.model';
import {Injectable} from '@angular/core';

export interface StoreItemState extends EntityState<StoreItemModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'storeItemStore'})
@Injectable({
  providedIn: 'root'
})
export class StoreItemStore extends EntityStore<StoreItemState, StoreItemModel> {
  constructor() {
    super(initialState);
  }
}
