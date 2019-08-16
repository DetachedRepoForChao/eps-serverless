import { SecurityRole } from './securityrole.model';
import { Department } from './department.model';

export class User {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    securityRoleId: any;
    departmentId: any;
    points: number;
    password: string;
    phone: string;
    birthdate: string;
}
