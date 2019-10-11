import { ID, guid } from '@datorama/akita';
import {EntityUserModel} from '../../user/state/entity-user.model';
import {StoreItemModel} from '../../store-item/state/store-item.model';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';

export type UserHasStoreItemModel = {
  id: ID;
  recordId: number;
  userId: number;
  managerId: number;
  managerFirstName: string;
  managerLastName: string;
  managerEmail: string;
  storeItemId: number;
  storeItemName: string;
  storeItemDescription: string;
  storeItemCost: number;
  status: string;
  cancelDescription: string;
  dateModified: any;
};

export function createStoreItemModel({ recordId, userId, managerId, managerFirstName, managerLastName, managerEmail, storeItemId,
                                       storeItemName, storeItemDescription, storeItemCost, status,
                                       cancelDescription }: Partial<UserHasStoreItemModel>) {

  return {
    id: guid(),
    recordId,
    userId,
    managerId,
    managerFirstName,
    managerLastName,
    managerEmail,
    storeItemId,
    storeItemName,
    storeItemDescription,
    storeItemCost,
    status,
    cancelDescription,
    dateModified: Date.now()
  } as UserHasStoreItemModel;
}
