import { ID, guid } from '@datorama/akita';

export type PointItemModel = {
  id: ID;
  itemId: number;
  name: string;
  description: string;
  amount: number;
  coreValues: string[];
  dateModified: any;
  createdByUsername: string;
  createdByUser: any;
  updatedByUsername: string;
  updatedByUser: any;
};

export function createPointItemModel({ itemId, name, description, amount, coreValues, createdByUsername, createdByUser, updatedByUsername,
                                       updatedByUser}: Partial<PointItemModel>) {

  return {
    id: guid(),
    itemId,
    name,
    description,
    amount,
    coreValues,
    createdByUsername,
    createdByUser,
    updatedByUsername,
    updatedByUser,
    dateModified: Date.now(),
  } as PointItemModel;
}
