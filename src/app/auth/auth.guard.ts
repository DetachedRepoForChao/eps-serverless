import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { User } from '../shared/user.model';
import decode from 'jwt-decode';
import {AuthService} from '../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  componentName = 'auth.guard';

  constructor(private userService: UserService,
              private router: Router,
              private authService: AuthService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const functionName = 'canActivate';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const localStorageItems = [];
    for ( let i = 0; i < localStorage.length; i++) {
      localStorageItems.push(localStorage.key(i));
    }

    const accessTokenName = localStorageItems.find((x: string) => x.includes('accessToken') === true);
    const accessTokenValue = localStorage.getItem(accessTokenName);

    if (!accessTokenValue) {
      console.warn(`${functionFullName}: user not logged in`);
      this.router.navigateByUrl('/login');
      this.userService.deleteToken();
      return false;
    } else {
      console.log(`${functionFullName}: user is logged in`);
      return true;
    }
  }
}
