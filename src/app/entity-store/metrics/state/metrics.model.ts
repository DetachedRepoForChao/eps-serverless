import { ID, guid } from '@datorama/akita';

export type MetricsModel = {
  id: ID;
  itemId: number;
  name: string;
  description: string;
  cost: number;
  imagePath: string;
  imageResolvedUrl: string;
};

export function createMetricsModel({ itemId, name, description, cost, imagePath, imageResolvedUrl }: Partial<MetricsModel>) {

  return {
    id: guid(),
    itemId,
    name,
    description,
    cost,
    imagePath,
    imageResolvedUrl
  } as MetricsModel;
}
