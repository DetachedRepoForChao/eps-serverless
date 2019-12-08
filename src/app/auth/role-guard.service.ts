import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';

import decode from 'jwt-decode';

import {Observable} from 'rxjs';
import {AuthService} from '../login/auth.service';

@Injectable()
export class RoleGuardService implements CanActivate {
  constructor(public router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const expectedRoleId = route.data.expectedRoleId;

    return this.authService.isLoggedIn()
      .then(result => {
        // console.log(result);
        if (result) {
          return true;
        } else {
          this.router.navigateByUrl('/login').then();
          this.authService.signOut().then();
          return false;
        }
      });
  }

/*  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('role-guard canActivate route:');
    console.log(route);
    // this will be passed from the route config
    // on the data property
    const expectedRoleId = route.data.expectedRoleId;
    const token = localStorage.getItem('token');
    console.log('expectedRoleId: ' + expectedRoleId);

    // decode the token to get its payload
    const tokenPayload = decode(token);
    const actualRoleId = +localStorage.getItem('securityRoleId');
    console.log('actualRoleId: ' + actualRoleId);
    if (
      !this.userService.isLoggedIn() ||
      actualRoleId !== expectedRoleId
    ) {
      console.log('role-guard denied');
      localStorage.removeItem('token');
      this.router.navigate(['login']);
      return false;
    }
    console.log('role-guard success');
    return true;
  }*/
}
