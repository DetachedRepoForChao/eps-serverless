import { Injectable } from '@angular/core';

import {NotificationState, NotificationStore } from './notification.store';
import { QueryEntity } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { VISIBILITY_FILTER } from '../filter/notification-filter.model';
import { map } from 'rxjs/operators';
import {NotificationModel} from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationQuery extends QueryEntity<NotificationState, NotificationModel> {
  selectVisibilityFilter$ = this.select(state => state.ui.filter);


  selectVisibleNotifications = combineLatest(
    this.selectVisibilityFilter$,
    this.selectAll(),
    this.getVisibleNotification,
  );


  constructor(protected store: NotificationStore) {
    super(store);
  }



  private getVisibleNotification(filter, Notifications): NotificationModel[] {
    switch (filter) {
      case  VISIBILITY_FILTER.SHOW_COMPLETED:
        return  Notifications.filter(t => t.completed);
      case VISIBILITY_FILTER.SHOW_ACTIVE:
        return Notifications.SHOW_ACTIVE;
      default:
        return Notifications;
    }

  }

}
