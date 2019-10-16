import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { Router } from '@angular/router';
import { Globals} from '../../globals';
import {AchievementComponent} from '../../shared/achievement/achievement.component';
import {AchievementService} from '../../shared/achievement/achievement.service';
import {AuthService} from '../../login/auth.service';
import {resetStores} from '@datorama/akita';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  constructor(public globals: Globals,
              private userService: UserService,
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

//uploadFile(event:any){
// let file = event.target.files[0];
//let fileName = file.name;
// console.log(file)
// console.log(fileName)
// let formData = new FormData();
// formData.append('file',file);
// this.examService.uploadAnswer(formData);
// }
}
