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
  preferredName: string;
  position: string;
  points: number;
  pointsPool: number;
  pointsPoolMax: number;
  birthdate: string;
  gender: string;
  securityRole: SecurityRole;
  department: Department;
  email: string;
  phone: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  completeAchievementsTotal: number;
  dateModified: any;
  active: boolean;
  dateOfHire: string;
  dateOfTermination: string;
  quote: string;
  phonePublic: boolean;
  emailPublic: boolean;
  genderPublic: boolean;
  birthdatePublic: boolean;
  pointAwardsPublic: boolean;
  achievementsPublic: boolean;
  pointsPublic: boolean;
  coreValuesPublic: boolean;
  phoneNotifications: boolean;
  emailNotifications: boolean;
  awardManager: boolean;

};

export function createEntityUserModel({ userId, username, firstName, lastName, middleName, preferredName, position, points, pointsPool,
                                        pointsPoolMax, birthdate, gender, securityRole, department, email, phone, avatarPath,
                                        avatarResolvedUrl, completeAchievementsTotal, active, dateOfHire, dateOfTermination, quote,
                                        phonePublic,  emailPublic, genderPublic, birthdatePublic, pointAwardsPublic, achievementsPublic,
                                        pointsPublic, coreValuesPublic, phoneNotifications, emailNotifications,
                                        awardManager}: Partial<EntityUserModel>) {
  return {
    id: guid(),
    userId,
    username,
    firstName,
    lastName,
    middleName,
    preferredName,
    position,
    points,
    pointsPool,
    pointsPoolMax,
    birthdate,
    gender,
    securityRole,
    department,
    email,
    phone,
    avatarPath,
    avatarResolvedUrl,
    completeAchievementsTotal,
    active,
    dateOfHire,
    dateOfTermination,
    quote,
    phonePublic,
    emailPublic,
    genderPublic,
    birthdatePublic,
    pointAwardsPublic,
    achievementsPublic,
    pointsPublic,
    coreValuesPublic,
    phoneNotifications,
    emailNotifications,
    awardManager,
    dateModified: Date.now(),
  } as EntityUserModel;
}
