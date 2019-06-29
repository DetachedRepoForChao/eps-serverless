// built-in
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './login/sign-up/sign-up.component';
import { AchievementComponent} from './shared/achievement/achievement.component';
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
import { WebsocketComponent } from './websocket/websocket.component';
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

// const config: SocketIoConfig = {url: 'http://localhost:3000'};


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
    WebsocketComponent,
    ImageGalleryComponent,
    KeysPipe,
    ProfileCardManagerComponent,
    TrophyComponent,

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
    // SocketIoModule.forRoot(config)
    NgxImageGalleryModule,
    FlexLayoutModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatListModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }, AuthGuard, RoleGuardService, UserService, Globals],
  bootstrap: [AppComponent]
})
export class AppModule { }
