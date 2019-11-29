import { Injectable } from '@angular/core';
import { PointItemTransactionState, PointItemTransactionStore } from './point-item-transaction.store';
import { PointItemTransactionModel } from './point-item-transaction.model';
import {Order, QueryEntity} from '@datorama/akita';
import {combineLatest, Observable} from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/point-item-transaction-filter.model';
import { map } from 'rxjs/operators';
import {PointItemQuery} from '../../point-item/state/point-item.query';

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


  constructor(protected store: PointItemTransactionStore,
              private pointItemQuery: PointItemQuery) {
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



  public selectAllAddTransactions() {
    return this.selectAll({
      filterBy: e => e.type === 'Add',
      sortBy: 'transactionId',
      sortByOrder: Order.DESC
    });
  }

  public getUserTotalCoreValues(userId: number): Observable<any> {
    console.log(`Starting get user total core values for user id ${userId}`);
    const coreValuesList = {
      happy: 1,
      fun: 1,
      genuine: 1,
      caring: 1,
      respect: 1,
      honest: 1,
    };

    return new Observable<any>(observer => {
      this.selectAll({
        filterBy: e => e.targetUserId === userId
      })
        .subscribe(transactions => {
          for (const transaction of transactions) {
            // console.log(transaction);
            const transactionCoreValues = transaction.coreValues;
            for (const coreValue of transactionCoreValues) {
              coreValuesList[coreValue] += 1;
            }
          }

          console.log(`Core Values List for user id ${userId}:`);
          console.log(coreValuesList);
          observer.next(coreValuesList);
          observer.complete();
        });
    });
  }
}
