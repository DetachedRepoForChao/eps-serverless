import { ID, guid } from '@datorama/akita';
import {EntityUserModel} from '../../user/state/entity-user.model';
import {StoreItemModel} from '../../store-item/state/store-item.model';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';

export type UserHasStoreItemModel = {
  id: ID;
  recordId: number;
  userId: number;
  storeItemId: number;
  status: string;
  cancelDescription: string;
  dateModified: any;
};

export function createStoreItemModel({ recordId, userId, storeItemId, status, cancelDescription }: Partial<UserHasStoreItemModel>) {

  return {
    id: guid(),
    recordId,
    userId,
    storeItemId,
    status,
    cancelDescription,
    dateModified: Date.now()
  } as UserHasStoreItemModel;
}
