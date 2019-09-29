import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import {AchievementComponent} from '../../shared/achievement/achievement.component';
import {AchievementService} from '../../shared/achievement/achievement.service';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  constructor(public globals: Globals,
              private userService: UserService,
              private router: Router,
              private achievementService: AchievementService) { }

  ngOnInit() {
    this.achievementService.getUserAchievements();

  }

 onLogout() {
    this.userService.deleteToken();  
    localStorage.clear();
//    resetStores();
    this.router.navigate(['/login']);
  }
}