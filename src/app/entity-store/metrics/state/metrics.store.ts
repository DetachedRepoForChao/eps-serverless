import { MetricsModel } from './metrics.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/metrics-filter.model';
import {Injectable} from '@angular/core';

export interface MetricsState extends EntityState<MetricsModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'metricsStore'})
@Injectable({
  providedIn: 'root'
})
export class MetricsStore extends EntityStore<MetricsState, MetricsModel> {
  constructor() {
    super(initialState);
  }
}

