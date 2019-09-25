import { ID, guid } from '@datorama/akita';

export type PointItemModel = {
  id: ID;
  itemId: number;
  name: string;
  description: string;
  amount: number;
  coreValues: string[];
  dateModified: any;
};

export function createPointItemModel({ itemId, name, description, amount, coreValues, }: Partial<PointItemModel>) {

  return {
    id: guid(),
    itemId,
    name,
    description,
    amount,
    coreValues,
    dateModified: Date.now(),
  } as PointItemModel;
}
