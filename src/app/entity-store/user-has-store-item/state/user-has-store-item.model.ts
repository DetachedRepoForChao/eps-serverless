import { ID, guid } from '@datorama/akita';
import {EntityUserModel} from '../../user/state/entity-user.model';
import {StoreItemModel} from '../../store-item/state/store-item.model';
import {EntityCurrentUserModel} from '../../current-user/state/entity-current-user.model';

export type UserHasStoreItemModel = {
  id: ID;
  recordId: number;
  userId: number;
  userUsername: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  managerId: number;
  managerUsername: string;
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
  cancelledAt: any;
  readyForPickupAt: any;
  pickedUpAt: any;
  createdAt: any;
  updatedAt: any
};

export function createStoreItemModel({ recordId, userId, userUsername, userFirstName, userLastName, userEmail, managerId, managerUsername,
                                       managerFirstName, managerLastName, managerEmail, storeItemId, storeItemName, storeItemDescription,
                                       storeItemCost, status, cancelDescription, cancelledAt, readyForPickupAt, pickedUpAt, createdAt,
                                       updatedAt }: Partial<UserHasStoreItemModel>) {

  return {
    id: guid(),
    recordId,
    userId,
    userUsername,
    userFirstName,
    userLastName,
    userEmail,
    managerId,
    managerUsername,
    managerFirstName,
    managerLastName,
    managerEmail,
    storeItemId,
    storeItemName,
    storeItemDescription,
    storeItemCost,
    status,
    cancelDescription,
    cancelledAt,
    readyForPickupAt,
    pickedUpAt,
    createdAt,
    updatedAt,
    dateModified: Date.now()
  } as UserHasStoreItemModel;
}
