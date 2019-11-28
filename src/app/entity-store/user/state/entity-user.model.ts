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
  prefix: string;
  suffix: string;
  position: string;
  points: number;
  pointsPool: number;
  birthdate: string;
  preferredPronoun: string;
  sex: string;
  gender: string;
  securityRole: SecurityRole;
  department: Department;
  email: string;
  phone: string;
  avatarBase64String: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  completeAchievementsTotal: number;
  dateModified: any;
  active: boolean;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zip: number;
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

};

export function createEntityUserModel({ userId, username, firstName, lastName, middleName, preferredName, prefix, suffix, position,
                                        points, pointsPool, birthdate, preferredPronoun, sex, gender, securityRole, department, email,
                                        phone, avatarBase64String, avatarPath, avatarResolvedUrl, completeAchievementsTotal, active,
                                        address1, address2, city, state, country, zip, dateOfHire, dateOfTermination, quote,
                                        phonePublic,  emailPublic, genderPublic, birthdatePublic, pointAwardsPublic, achievementsPublic,
                                        pointsPublic, coreValuesPublic}: Partial<EntityUserModel>) {
  return {
    id: guid(),
    userId,
    username,
    firstName,
    lastName,
    middleName,
    preferredName,
    prefix,
    suffix,
    position,
    points,
    pointsPool,
    birthdate,
    preferredPronoun,
    sex,
    gender,
    securityRole,
    department,
    email,
    phone,
    avatarBase64String,
    avatarPath,
    avatarResolvedUrl,
    completeAchievementsTotal,
    active,
    address1,
    address2,
    city,
    state,
    country,
    zip,
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
    dateModified: Date.now(),
  } as EntityUserModel;
}
