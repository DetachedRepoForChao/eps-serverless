import { ID, guid } from '@datorama/akita';

export type NotificationModel = {
  id: ID;
  NotificationId: Number;
  title: string;
  audience: string;
  event: string;
  createdAt: any;
  description: string;
  updatedAt: any;
  timeSeen: any;
  targetUserId: string;
};


export function createNotificationModel({ NotificationId, title, description, audience, event, createdAt, updatedAt, timeSeen,
                                          targetUserId }: Partial<NotificationModel>) {

  return {
    id: guid(),
    NotificationId,
    title,
    description,
    audience,
    event,
    createdAt,
    timeSeen,
    targetUserId,
    updatedAt: Date.now(),
  } as NotificationModel;
}
