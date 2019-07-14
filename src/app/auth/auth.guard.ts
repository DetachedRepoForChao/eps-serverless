import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { User } from '../shared/user.model';
import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  //public currentUser;
  //public userDetails;
  constructor(private userService: UserService, private router: Router) {
    //this.currentUser = this.userService.getUserProfile();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoleId = route.data.expectedRoleId;
    const token = localStorage.getItem('token');

    if (!this.userService.isLoggedIn()) {

        this.router.navigateByUrl('/login');
        this.userService.deleteToken();
        return false;
    } else {

      return true;
    }
  }
}
