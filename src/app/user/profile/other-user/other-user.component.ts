import { Component, OnInit } from '@angular/core';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityCurrentUserQuery} from '../../../entity-store/current-user/state/entity-current-user.query';
import {ActivatedRoute} from '@angular/router';
import {EntityUserModel} from '../../../entity-store/user/state/entity-user.model';
import {Observable} from 'rxjs';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {AchievementService} from '../../../entity-store/achievement/state/achievement.service';
import {AchievementQuery} from '../../../entity-store/achievement/state/achievement.query';

@Component({
  selector: 'app-other-user',
  templateUrl: './other-user.component.html',
  styleUrls: ['./other-user.component.css']
})
export class OtherUserComponent implements OnInit {

  user$: Observable<EntityUserModel[]> = null;
  leaderboardUsers$: Observable<EntityUserModel[]> = null;
  isUserDataRetrieved = false;


  constructor(private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private achievementService: AchievementService,
              private achievementQuery: AchievementQuery,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.userService.cacheUsers().subscribe();
    this.achievementService.cacheAchievements().subscribe();

    this.user$ = this.userQuery.selectAll({
      filterBy: e => e.username === this.route.snapshot.params.username
    });

    this.user$.subscribe(user => {
      console.log(user[0]);
      this.isUserDataRetrieved = true;
    });

    this.leaderboardUsers$ = this.userQuery.selectAll({
      filterBy: userEntity => userEntity.securityRole.Id === 1,
    });

  }

}
