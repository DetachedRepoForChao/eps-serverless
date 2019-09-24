import { ID, guid } from '@datorama/akita';
import {SecurityRole} from '../../../shared/securityrole.model';
import {Department} from '../../../shared/department.model';

export type EntityCurrentUserModel = {
  id: ID;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthdate: string;
  position: string;
  points: number;
  pointsPool: number;
  securityRole: SecurityRole;
  department: Department;
  email: string;
  phone: string;
  avatarBase64String: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  dateModified: any;
  isCurrentUser: boolean;
};

export function createEntityCurrentUserModel({ userId, username, firstName, lastName, middleName, birthdate, position, points, pointsPool,
                                               securityRole, department, email, phone, avatarBase64String, avatarPath, avatarResolvedUrl,
                                               isCurrentUser }: Partial<EntityCurrentUserModel>) {
  console.log('creatingCurrentUserModel... pointsPool');
  console.log(pointsPool);

  return {
    id: guid(),
    userId,
    username,
    firstName,
    lastName,
    middleName,
    birthdate,
    position,
    points,
    pointsPool,
    securityRole,
    department,
    email,
    phone,
    avatarBase64String,
    avatarPath,
    avatarResolvedUrl,
    dateModified: Date.now(),
    isCurrentUser
  } as EntityCurrentUserModel;
}
