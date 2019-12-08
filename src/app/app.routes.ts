import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { UserComponent } from './user/user.component';
import { AuthGuard } from './auth/auth.guard';

import { SecurityRole } from './shared/securityrole.model';
import {AdminUserComponent} from './user/admin-user/admin-user.component';
import {RoleGuardService as RoleGuard} from './auth/role-guard.service';
import {ProfileComponent} from './user/profile/profile.component';
import {HomepageComponent} from './user/homepage/homepage.component';
import {ConfirmCodeComponent} from './login/confirm-code/confirm-code.component';
import {PointsStoreComponent} from './user/points-store/points-store.component';
import {ForgotPasswordComponent} from './login/forgot-password/forgot-password.component';

import {User} from './shared/user.model';
import {ConfirmItemPurchaseComponent} from './user/confirm-item-purchase/confirm-item-purchase.component';
import {NewPasswordComponent} from './login/new-password/new-password.component';
import { ReportComponent } from './user/admin-user/event-card/report/report.component';

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
    path: 'forgotPassword',
    component: LoginComponent,
    children: [
      { path: '', component: ForgotPasswordComponent },
    ]
  },
  {
    path: 'newPassword',
    component: LoginComponent,
    children: [
      { path: '', component: NewPasswordComponent },
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
    data: {
      roles: ['admin', 'employee', 'manager']
    },
    children: [
      {
        path: 'profile/:username',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: {
          roles: ['admin', 'employee', 'manager']
        }
      },
      {
        path: 'homepage', component: HomepageComponent,
        canActivate: [AuthGuard],
        data: {
          roles: ['employee', 'manager']
        }
      },
      {
        path: 'admin-user', component: AdminUserComponent,
        canActivate: [AuthGuard],
        data: {
          roles: ['admin']
        }
      },
      {
        path: 'store',
        component: PointsStoreComponent,
        canActivate: [AuthGuard],
        data: {
          roles: ['admin', 'employee', 'manager']
        }
      },
      {
        path: 'confirm-item-purchase',
        component: ConfirmItemPurchaseComponent,
        // canActivate: [AuthGuard],
        data: {
          roles: ['admin', 'manager']
        }
      },
      {
        path: 'report',
        component: ReportComponent,
        // canActivate: [AuthGuard],
        data: {
          roles: ['admin']
        }
      }
    ]
  },
  {
      path: '', redirectTo: '/login', pathMatch: 'full'
  },


];
