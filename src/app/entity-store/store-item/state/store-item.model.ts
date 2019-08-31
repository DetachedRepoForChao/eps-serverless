import { ID, guid } from '@datorama/akita';

export type StoreItemModel = {
  id: ID;
  itemId: number;
  name: string;
  description: string;
  cost: number;
  imagePath: string;
  imageResolvedUrl: string;
};

export function createStoreItemModel({ itemId, name, description, cost, imagePath, imageResolvedUrl }: Partial<StoreItemModel>) {

  return {
    id: guid(),
    itemId,
    name,
    description,
    cost,
    imagePath,
    imageResolvedUrl
  } as StoreItemModel;
}
