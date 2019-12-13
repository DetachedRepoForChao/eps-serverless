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
  preferredName: string;
  birthdate: string;
  position: string;
  gender: string;
  dateOfHire: any;
  points: number;
  pointsPool: number;
  securityRole: SecurityRole;
  department: Department;
  email: string;
  phone: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  dateModified: any;
  quote: string;
  phonePublic: boolean;
  emailPublic: boolean;
  genderPublic: boolean;
  birthdatePublic: boolean;
  pointAwardsPublic: boolean;
  achievementsPublic: boolean;
  pointsPublic: boolean;
  coreValuesPublic: boolean;
  emailNotifications: boolean;
  phoneNotifications: boolean;
  awardsManager: boolean;
};

export function createEntityCurrentUserModel({ userId, username, firstName, lastName, middleName, preferredName, birthdate, position,
                                               gender, dateOfHire, points, pointsPool, securityRole, department, email, phone, avatarPath,
                                               avatarResolvedUrl, quote, phonePublic, emailPublic, genderPublic, birthdatePublic,
                                               pointAwardsPublic, achievementsPublic, pointsPublic, coreValuesPublic, emailNotifications,
                                               phoneNotifications, awardsManager }: Partial<EntityCurrentUserModel>) {

  return {
    id: guid(),
    userId,
    username,
    firstName,
    lastName,
    middleName,
    preferredName,
    birthdate,
    position,
    gender,
    dateOfHire,
    points,
    pointsPool,
    securityRole,
    department,
    email,
    phone,
    avatarPath,
    avatarResolvedUrl,
    quote,
    phonePublic,
    emailPublic,
    genderPublic,
    birthdatePublic,
    pointAwardsPublic,
    achievementsPublic,
    pointsPublic,
    coreValuesPublic,
    emailNotifications,
    phoneNotifications,
    awardsManager,
    dateModified: Date.now(),
  } as EntityCurrentUserModel;
}
