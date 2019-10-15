import { FeatureModel } from './feature.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { VISIBILITY_FILTER} from '../filter/feature-filter.model';
import {Injectable} from '@angular/core';

export interface FeatureState extends EntityState<FeatureModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'featureStore'})
@Injectable({
  providedIn: 'root'
})
export class FeatureStore extends EntityStore<FeatureState, FeatureModel> {
  constructor() {
    super(initialState);
  }
}
