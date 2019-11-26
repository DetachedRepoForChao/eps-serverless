import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../shared/user.service';
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
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

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

}
