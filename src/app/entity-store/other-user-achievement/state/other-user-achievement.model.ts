import { ID, guid } from '@datorama/akita';

export type OtherUserAchievementModel = {
  id: ID;
  userId: number;
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
  level: number;
  roles: any;
  completedAt: any;
  acknowledgedAt: any;
  updatedAt: any;
  dateModified: any;
};

export function createEntityOtherUserAchievementModel({ userId, achievementId, name, description, cost, progress, progressId,
                                                        achievementStatus, progressStatus, family, startAmount, level, roles, completedAt,
                                                        acknowledgedAt, updatedAt}: Partial<OtherUserAchievementModel>) {

  return {
    id: guid(),
    userId,
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
    level,
    roles,
    completedAt,
    acknowledgedAt,
    updatedAt,
    dateModified: Date.now(),
  } as OtherUserAchievementModel;
}
