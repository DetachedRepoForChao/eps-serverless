import { ID, guid } from '@datorama/akita';

export type FeatureModel = {
  id: ID;
  featureId: number;
  name: string;
  description: string;
  achievementId: number;
  unlockDescription: string;
  dateModified: any;
};

export function createFeatureModel({ featureId, name, description, achievementId, unlockDescription }: Partial<FeatureModel>) {

  return {
    id: guid(),
    featureId,
    name,
    description,
    achievementId,
    unlockDescription,
    dateModified: Date.now()
  } as FeatureModel;
}
