import { Injectable } from '@angular/core';
import { PointItemTransactionState, PointItemTransactionStore } from './point-item-transaction.store';
import { PointItemTransactionModel } from './point-item-transaction.model';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/point-item-transaction-filter.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PointItemTransactionQuery extends QueryEntity<PointItemTransactionState, PointItemTransactionModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisiblePointItemTransactions = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisiblePointItemTransactions
  );


  constructor(protected store: PointItemTransactionStore) {
    super(store);
  }


  private getVisiblePointItemTransactions(filter, pointItemTransactions): PointItemTransactionModel[] {
    switch (filter) {
      case VISIBILITY_FILTER.SHOW_COMPLETED:
        return pointItemTransactions.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return pointItemTransactions.filter(t => !t.completed);
      default:
        return pointItemTransactions;
    }
  }

  // public getUser(username: string): EntityUserAvatarModel {
/*  public getCurrentUser() {
    const currentUserAvatar = this.getAll();
    return currentUserAvatar;
  }*/
}
