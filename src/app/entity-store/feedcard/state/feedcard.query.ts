import { Injectable } from '@angular/core';
import { FeedcardState, FeedcardStore } from './feedcard.store';
import { FeedcardModel } from './feedcard.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/feedcard-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedcardQuery extends QueryEntity<FeedcardState, FeedcardModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleFeatures = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisiblefeedcards
  );


  constructor(protected store: FeedcardStore) {
    super(store);
  }


  private getVisiblefeedcards(filter, feedcards): FeedcardModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return feedcards.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return feedcards.filter(t => !t.completed);
      default:
        return feedcards;
    }
  }

  public getCurrentfeedcard() {
    return this.selectAll();
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
