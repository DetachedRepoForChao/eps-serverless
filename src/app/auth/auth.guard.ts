import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import decode from 'jwt-decode';
import {AuthService} from '../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  componentName = 'auth.guard';

  constructor(private router: Router,
              private authService: AuthService) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const roles: string[] = next.data['roles'];
    const url: string = state.url;
    console.log(`url: ${url}`);
    return this.authService.isLoggedIn()
      .then(result => {
        // return this.checkLogin(url);
        // console.log(result);
        if (result) {
          return this.authService.currentUserInfo()
            .then(currentUser => {
              const securityRoleName = currentUser.attributes['custom:security_role'];
              if (url === '/user') {
                switch (securityRoleName) {
                  case 'employee': {
                    this.router.navigate(['/', 'user', 'homepage']);
                    return true;
                  }
                  case 'manager': {
                    this.router.navigate(['/', 'user', 'homepage']);
                    return true;
                  }
                  case 'admin': {
                    this.router.navigate(['/', 'user', 'admin-user']);
                    return true;
                  }
                }
              } else {
                if (roles.find(x => x === securityRoleName)) {
                  return true;
                } else {
                  this.router.navigateByUrl('/user').then();
                  return false;
                }
              }

            });
        } else {
          this.router.navigate(['/' , 'login'], {queryParams: {returnUrl: state.url}});
          this.authService.signOut().then();
          return false;
        }
      });
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): boolean {
    console.log('checkLogin url');
    console.log(url);
    if (this.authService.loggedIn) {
      if (url === '/user') {
        this.authService.currentUserInfo()
          .then(currentUser => {
            const securityRoleName = currentUser.attributes['custom:security_role'];
            switch (securityRoleName) {
              case 'employee': {
                this.router.navigate(['/', 'user', 'homepage']);
                return true;
              }
              case 'manager': {
                this.router.navigate(['/', 'user', 'homepage']);
                return true;
              }
              case 'admin': {
                this.router.navigate(['/', 'user', 'admin-user']);
                return true;
              }
            }
          });
      } else {
        return true;
      }
    }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    this.authService.signOut().then();
    return false;
  }

}
