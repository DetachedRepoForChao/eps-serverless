import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { UserComponent } from './user/user.component';
import { AuthGuard } from './auth/auth.guard';

import { SecurityRole } from './shared/securityrole.model';
import {AdminUserComponent} from './user/admin-user/admin-user.component';
import {RoleGuardService as RoleGuard} from './auth/role-guard.service';
import {StandardUserComponent} from './user/standard-user/standard-user.component';
import {ManagerUserComponent} from './user/manager-user/manager-user.component';
import {ProfileComponent} from './user/profile/profile.component';
import {HomepageComponent} from './user/homepage/homepage.component';
import {ConfirmCodeComponent} from './login/confirm-code/confirm-code.component';
import {PointsStoreComponent} from './user/points-store/points-store.component';

export const appRoutes: Routes = [
  {
      path: 'signup',
      component: LoginComponent,
      children: [
        { path: '', component: SignUpComponent },
      ]
  },
  {
    path: 'signin',
    component: LoginComponent,
    children: [
      { path: '', component: SignInComponent },
    ]
  },
  {
    path: 'confirm',
    component: LoginComponent,
    children: [
      { path: '', component: ConfirmCodeComponent },
    ]
  },
  {
      path: 'login',
      component: LoginComponent,
      children: [
        { path: '', component: SignInComponent },
      ]
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'homepage',
    component: UserComponent,
    canActivate: [AuthGuard],
    children: [{path: '', component: HomepageComponent}],
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'store',
    component: PointsStoreComponent,
    canActivate: [AuthGuard],
  },
  /*
  {
    path: 'standard-user',
    component: UserComponent,
    canActivate: [RoleGuard],
    children: [{path: '', component: StandardUserComponent}],
    data: {
      expectedRoleId: 1
    }
  },
  {
    path: 'manager-user',
    component: UserComponent,
    canActivate: [RoleGuard],
    children: [{path: '', component: ManagerUserComponent}],
    data: {
      expectedRoleId: 2
    }
  },
  {
    path: 'admin-user',
    component: UserComponent,
    canActivate: [RoleGuard],
    children: [{path: '', component: AdminUserComponent}],
    data: {
      expectedRoleId: 3
    }

  }, */
  {
      path: '', redirectTo: '/login', pathMatch: 'full'
  }
];
