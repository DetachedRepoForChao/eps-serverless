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

};

export function createEntityUserModel({ userId, username, firstName, lastName, middleName, preferredName, prefix, suffix, position,
                                              points, birthdate, preferredPronoun, sex, gender, securityRole, department, email, phone,
                                              avatarBase64String, avatarPath, avatarResolvedUrl, completeAchievementsTotal, active,
                                              address1, address2, city, state, country, zip, dateOfHire,
                                              dateOfTermination, quote}: Partial<EntityUserModel>) {
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
    dateModified: Date.now(),
  } as EntityUserModel;
}
