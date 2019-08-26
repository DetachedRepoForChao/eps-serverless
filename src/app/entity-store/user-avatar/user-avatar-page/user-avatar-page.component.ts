import { Component, OnInit } from '@angular/core';
import { initialFilters, VISIBILITY_FILTER } from '../filter/user-avatar-filter.model';
import { EntityUserAvatarModel } from '../state/entity-user-avatar.model';
import { EntityUserAvatarQuery } from '../state/entity-user-avatar.query';
import { EntityUserAvatarService } from '../state/entity-user-avatar.service';
import { Observable } from 'rxjs';
import { ID } from '@datorama/akita';
import { map } from 'rxjs/operators';
import { Storage } from 'aws-amplify';

@Component({
  selector: 'app-user-avatar-page',
  templateUrl: './user-avatar-page.component.html'
})
export class UserAvatarPageComponent implements OnInit {
  userAvatars$: Observable<EntityUserAvatarModel[]>;
  activeFilter$: Observable<VISIBILITY_FILTER>;
  filters = initialFilters;

  constructor(private entityUserAvatarQuery: EntityUserAvatarQuery,
              private entityUserAvatarService: EntityUserAvatarService) {
  }

  ngOnInit() {
    this.userAvatars$ = this.entityUserAvatarQuery.selectVisibleUserAvatars$;
    this.activeFilter$ = this.entityUserAvatarQuery.selectVisibilityFilter$;
  }


  add(input: HTMLInputElement) {

    let avatarPath;
    if (input.value === 'mbado') {
      avatarPath = 'protected/us-east-1:822e6f40-361b-4f0a-a8e8-2cfcc6547420/avatar_x186fc09kbjzjdop7j.png';
    }
    if (input.value === 'hulk') {
      avatarPath = 'protected/us-east-1:4d6125b2-9525-4199-a874-c798f4b6c773/avatar_iqtj43tstbijzkco2ws.png';
    }

    const username = input.value;
    const base64 = '';
    const path = avatarPath;
    const key = path.split('/')[2];
    const identityId = path.split('/')[1];
    Storage.get(key, {
      level: 'protected',
      identityId: identityId
    })
      .then((result: string) => {
        console.log(result);
        const resolved = result;
        this.entityUserAvatarService.add(username, base64, path, resolved);
        input.value = '';
      });

  }

  complete(userAvatar: EntityUserAvatarModel) {
    this.entityUserAvatarService.complete(userAvatar);
  }

  delete(id: ID) {
    console.log(`user-avatar-page.component: delete ${id}`);
    this.entityUserAvatarService.delete(id);
  }

  changeFilter(filter: VISIBILITY_FILTER) {
    this.entityUserAvatarService.updateFilter(filter);
  }

  getUserAvatar(username: string) {
    console.log(`query.getUserAvatar(${username}):`);
    this.entityUserAvatarQuery.getUserAvatar('mbado');
    console.log(`query.getHasCache(): ${this.entityUserAvatarQuery.getHasCache()}`);
  }

/*  getSomething(username: string) {
    this.entityUserAvatarService.getSomething(username)
      .subscribe(uhhh => {
        console.log(uhhh);
      });

    console.log(this.entityUserAvatarQuery.getHasCache());
    console.log(this.entityUserAvatarQuery);
  }*/

  showStore() {
    this.entityUserAvatarService.showStore();
  }

  getUserAvatars() {
    this.entityUserAvatarService.getUserAvatars()
      .subscribe(avatarsStore => {
        console.log(avatarsStore);
      });
  }

}
