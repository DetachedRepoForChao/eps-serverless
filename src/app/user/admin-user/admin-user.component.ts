import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import {AchievementService} from '../../shared/achievement/achievement.service';
import {AuthService} from '../../login/auth.service';
import {resetStores} from '@datorama/akita';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  componentName = 'admin-user.component';

  constructor(public globals: Globals,
              private router: Router,
              private achievementService: AchievementService,
              private authService: AuthService) { }

  ngOnInit() {
  }


  onLogout() {
    this.authService.signOut().then();
    resetStores();
    this.router.navigate(['/login']).then();
  }
}


