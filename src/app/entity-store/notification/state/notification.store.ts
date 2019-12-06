
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import {Injectable} from '@angular/core';
import {NotificationModel} from './notification.model';
import { VISIBILITY_FILTER} from '../filter/notification-filter.model';
export interface NotificationState extends EntityState<NotificationModel> {
  ui: {
    filter: VISIBILITY_FILTER
  };
}

const initialState = {
  ui: { filter: VISIBILITY_FILTER.SHOW_ALL }
};

@StoreConfig({name: 'notificationStore'})
@Injectable({
  providedIn: 'root'
})
export class NotificationStore extends EntityStore<NotificationState, NotificationModel> {
  constructor() {
    super(initialState);
  }
}
