import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import {FeedcardModel } from './feedcard.model';
import {VISIBILITY_FILTER } from '../filter/feedcard-filter.model';
import { Injectable} from '@angular/core';

export interface FeedcardState extends EntityState<FeedcardModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'feedcardStore'})
@Injectable({
  providedIn: 'root'
})
export class FeedcardStore extends EntityStore<FeedcardState, FeedcardModel> {
  constructor() {
    super(initialState);
  }
}
