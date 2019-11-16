import { PointItemTransactionModel } from './point-item-transaction.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/point-item-transaction-filter.model';
import {Injectable} from '@angular/core';

export interface PointItemTransactionState extends EntityState<PointItemTransactionModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'pointItemTransactionStore'})
@Injectable({
  providedIn: 'root'
})
export class PointItemTransactionStore extends EntityStore<PointItemTransactionState, PointItemTransactionModel> {
  constructor() {
    super(initialState);
  }
}
