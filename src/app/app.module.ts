// built-in
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialogModule } from '@angular/material/dialog';

// components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { AchievementComponent} from './shared/achievement/achievement.component';
import { ConfirmationDialogComponent } from './user/components/shared/confirmation-dialog/confirmation-dialog.component';
// routes
import { appRoutes } from './app.routes';
import { UserComponent } from './user/user.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { UserService } from './shared/user.service';
// other

import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';
import {RoleGuardService} from './auth/role-guard.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CustomMaterialModule } from './core/material.module';
import { StandardUserComponent } from './user/standard-user/standard-user.component';
import { AdminUserComponent } from './user/admin-user/admin-user.component';
import { Globals } from './globals';
import { ManagerUserComponent } from './user/manager-user/manager-user.component';
import { GiftPointsComponent } from './user/manager-user/gift-points/gift-points.component';
import { RegisterUserComponent } from './user/admin-user/register-user/register-user.component';
import { NotifierModule } from 'angular-notifier';
import { ProfileComponent } from './user/profile/profile.component';
import { HomepageComponent } from './user/homepage/homepage.component';
import { NavigationComponent } from './user/homepage/navigation/navigation.component';
import { ProfileCardComponent } from './user/homepage/profile-card/profile-card.component';
import { LeaderboardCardComponent } from './user/homepage/leaderboard-card/leaderboard-card.component';
import { ProgressCardComponent } from './user/homepage/progress-card/progress-card.component';
import { TwitterCardComponent } from './user/homepage/twitter-card/twitter-card.component';
import { NotesCardComponent } from './user/homepage/notes-card/notes-card.component';
import { FooterComponent } from './user/homepage/footer/footer.component';
import { FeedComponent } from './user/homepage/feed/feed.component';
// import { WebsocketComponent } from './websocket/websocket.component';
import { UserIdleModule } from 'angular-user-idle';
import { NgxImageGalleryModule} from 'ngx-image-gallery';
import { ImageGalleryComponent } from './shared/image-gallery/image-gallery.component';
import { KeysPipe } from './pipe/keys.pipe';
import {
  MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatListModule,
  MatToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import { ProfileCardManagerComponent } from './user/homepage/profile-card-manager/profile-card-manager.component';
import { TrophyComponent } from './shared/trophy/trophy.component';
// import {SocketService} from './shared/socket.service';

import {AmplifyAngularModule, AmplifyService} from 'aws-amplify-angular';
import { ConfirmCodeComponent } from './login/confirm-code/confirm-code.component';
import { RequestCacheService} from './shared/request-cache.service';
import { CachingInterceptorService} from './shared/caching-interceptor.service';
import { ImageCropperModule} from 'ngx-image-cropper';
import { NgxSpinnerModule} from 'ngx-spinner';
import { AwesomeTooltipDirectiveDirective } from './shared/awesome-tooltip/awesome-tooltip-directive.directive';
import { AwesomeTooltipComponent } from './shared/awesome-tooltip/awesome-tooltip.component';
import { PointsStoreComponent } from './user/points-store/points-store.component';
import { NG_ENTITY_SERVICE_CONFIG } from '@datorama/akita-ng-entity-service';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { environment } from '../environments/environment';
import { UserFiltersComponent} from './entity-store/user/filter/user-filters.component';
import { AchievementFiltersComponent} from './entity-store/achievement/filter/achievement-filters.component';
import { AvatarComponent } from './shared/avatar/avatar.component';
import { ImageCropperComponent } from './shared/image-cropper/image-cropper.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { PhonePipe } from './pipe/phone.pipe';
import { PhoneMaskDirective } from './directives/phone-mask.directive';
import { akitaConfig} from '@datorama/akita';
import { PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';

// const config: SocketIoConfig = {url: 'http://localhost:3000'};

akitaConfig({
  resettable: true
});

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    UserComponent,
    SignInComponent,
    StandardUserComponent,
    AdminUserComponent,
    AchievementComponent,
    ManagerUserComponent,
    GiftPointsComponent,
    RegisterUserComponent,
    ProfileComponent,
    HomepageComponent,
    NavigationComponent,
    ProfileCardComponent,
    LeaderboardCardComponent,
    ProgressCardComponent,
    TwitterCardComponent,
    NotesCardComponent,
    FooterComponent,
    FeedComponent,
    ConfirmationDialogComponent,
    // WebsocketComponent,
    ImageGalleryComponent,
    KeysPipe,
    ProfileCardManagerComponent,
    TrophyComponent,
    ConfirmCodeComponent,
    AwesomeTooltipDirectiveDirective,
    AwesomeTooltipComponent,
    PointsStoreComponent,
    UserFiltersComponent,
    AchievementFiltersComponent,
    AvatarComponent,
    ImageCropperComponent,
    ForgotPasswordComponent,
    PhonePipe,
    PhoneMaskDirective

  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    MatSelectModule,
    MatFormFieldModule,
    NotifierModule,
    // Optionally you can set time for `idle`, `timeout` and `ping` in seconds.
    // Default values: `idle` is 600 (10 minutes), `timeout` is 300 (5 minutes)
    // and `ping` is 120 (2 minutes).
    UserIdleModule.forRoot({idle: 600, timeout: 300, ping: 20}),
    // UserIdleModule.forRoot({idle: 10, timeout: 10, ping: 5}),
    // SocketIoModule.forRoot(config)
    NgxImageGalleryModule,
    FlexLayoutModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatListModule,
    AmplifyAngularModule,
    ReactiveFormsModule,
    ImageCropperModule,
    NgxSpinnerModule,
    OverlayModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule.forRoot(),
    PerfectScrollbarModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    /*    RequestCacheService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CachingInterceptorService,
          multi: true
        },*/
    AuthGuard,
    RoleGuardService,
    UserService,
    Globals,
    AmplifyService,
    { provide: NG_ENTITY_SERVICE_CONFIG, useValue: { baseUrl: 'https://jsonplaceholder.typicode.com' }},
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ],
  bootstrap: [AppComponent],
  entryComponents: [AwesomeTooltipComponent,
    ConfirmationDialogComponent
  ]
})
export class AppModule { }
