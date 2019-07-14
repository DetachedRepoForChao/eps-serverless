import { SecurityRole } from './securityrole.model';
import { Department } from './department.model';

export class User {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    securityRole: any;
    department: any;
    points: number;
    password: string;

}
