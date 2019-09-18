import { ID, guid } from '@datorama/akita';
import {SecurityRole} from '../../../shared/securityrole.model';
import {Department} from '../../../shared/department.model';

export type EntityUserModel = {
  id: ID;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  middleName: string;
  position: string;
  points: number;
  birthdate: string;
  securityRole: SecurityRole;
  department: Department;
  email: string;
  phone: string;
  avatarBase64String: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  dateModified: any;
};

export function createEntityUserAvatarModel({ userId, username, firstName, lastName, middleName, position, points, birthdate, securityRole,
                                              department, email, phone, avatarBase64String, avatarPath, avatarResolvedUrl }:
                                              Partial<EntityUserModel>) {
  return {
    id: guid(),
    userId,
    username,
    firstName,
    lastName,
    middleName,
    position,
    points,
    birthdate,
    securityRole,
    department,
    email,
    phone,
    avatarBase64String,
    avatarPath,
    avatarResolvedUrl,
    dateModified: Date.now(),
  } as EntityUserModel;
}
