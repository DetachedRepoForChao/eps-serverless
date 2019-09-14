import { ID, guid } from '@datorama/akita';

export type AchievementModel = {
  id: ID;
  achievementId: number;
  name: string;
  description: string;
  cost: number;
  progress: number;
  progressId: string;
  achievementStatus: string;
  progressStatus: string;
  family: string;
  startAmount: number;
  level: number
};

export function createEntityAchievementModel({ achievementId, name, description, cost, progress, progressId,
                                      achievementStatus, progressStatus, family, startAmount, level}: Partial<AchievementModel>) {

  return {
    id: guid(),
    achievementId,
    name,
    description,
    cost,
    progress,
    progressId,
    achievementStatus,
    progressStatus,
    family,
    startAmount,
    level
  } as AchievementModel;
}
