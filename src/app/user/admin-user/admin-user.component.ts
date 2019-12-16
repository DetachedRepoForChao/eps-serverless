import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import {AchievementService} from '../../shared/achievement/achievement.service';
import {AuthService} from '../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {NavigationService} from '../../shared/navigation.service';
import {takeUntil} from 'rxjs/operators';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit, OnDestroy {

  componentName = 'admin-user.component';

  private currentUserLoading$ = new Subject();
  private unsubscribe$ = new Subject();
  currentUser: EntityCurrentUserModel;

  constructor(private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService,
              private navigationService: NavigationService,
              private currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
            });
          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });

  }

  onSettingsClick() {

  }

  onLogout() {
    this.navigationService.onLogout();
  }

  scrollToNotifications() {
    const target = document.getElementById('notifications-scroll-anchor');
    target.scrollIntoView({behavior: 'smooth'});
  }


  ngOnDestroy(): void {
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}


