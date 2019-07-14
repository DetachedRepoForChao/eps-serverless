import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import {AchievementComponent} from '../../shared/achievement/achievement.component';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  constructor(public globals: Globals,
              private userService: UserService,
              private router: Router,
              private achievementComponent: AchievementComponent) { }

  ngOnInit() {
    this.achievementComponent.getUserAchievements();

  }

  onLogout() {
    this.userService.deleteToken();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
