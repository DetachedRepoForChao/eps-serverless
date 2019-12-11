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
  prefix: string;
  suffix: string;
  birthdate: string;
  position: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zip: number;
  preferredPronoun: string;
  sex: string;
  gender: string;
  dateOfHire: any;
  points: number;
  // pointsBalance: number;
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

export function createEntityCurrentUserModel({ userId, username, firstName, lastName, middleName, preferredName, prefix, suffix, birthdate,
                                               position, address1, address2, city, state, country, zip, preferredPronoun, sex, gender,
                                               dateOfHire, points, pointsPool, securityRole, department, email, phone,
                                               avatarBase64String, avatarPath, avatarResolvedUrl, isCurrentUser, quote, phonePublic,
                                               emailPublic, genderPublic, birthdatePublic, pointAwardsPublic, achievementsPublic,
                                               pointsPublic, coreValuesPublic }: Partial<EntityCurrentUserModel>) {

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
    birthdate,
    position,
    address1,
    address2,
    city,
    state,
    country,
    zip,
    preferredPronoun,
    sex,
    gender,
    dateOfHire,
    points,
    // pointsBalance,
    pointsPool,
    securityRole,
    department,
    email,
    phone,
    avatarBase64String,
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
    dateModified: Date.now(),
    isCurrentUser
  } as EntityCurrentUserModel;
}
