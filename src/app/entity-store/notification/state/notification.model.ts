import { ID, guid } from '@datorama/akita';

export type NotificationModel = {
  id: ID;
  notificationId: number;
  title: string;
  audience: string;
  event: string;
  createdAt: any;
  description: string;
  updatedAt: any;
  timeSeen: any;
  targetUserId: number;
  sourceUserId: number;
  departmentId: number;
  securityRoleId: number;
  status: number;
  dateModified: any;
};


export function createNotificationModel({ notificationId, title, description, audience, event, createdAt, updatedAt, timeSeen,
                                          targetUserId, sourceUserId, departmentId, securityRoleId, status}: Partial<NotificationModel>) {

  return {
    id: guid(),
    notificationId,
    title,
    description,
    audience,
    event,
    createdAt,
    updatedAt,
    timeSeen,
    targetUserId,
    sourceUserId,
    departmentId,
    securityRoleId,
    status,
    dateModified: Date.now(),
  } as NotificationModel;
}
