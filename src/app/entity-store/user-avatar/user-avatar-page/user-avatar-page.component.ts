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

    const username = 'mbado';
    const base64 = '';
    const path = 'protected/us-east-1:822e6f40-361b-4f0a-a8e8-2cfcc6547420/avatar_x186fc09kbjzjdop7j.png';
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
    this.entityUserAvatarService.delete(id);
  }

  changeFilter(filter: VISIBILITY_FILTER) {
    this.entityUserAvatarService.updateFilter(filter);
  }

  getUserAvatar() {
    this.entityUserAvatarQuery.getUserAvatar('mbado');
    console.log(this.entityUserAvatarQuery.getHasCache());
  }

  getSomething() {
    this.entityUserAvatarService.getSomething()
      .subscribe(uhhh => {
        console.log(uhhh);
      });

    console.log(this.entityUserAvatarQuery.getHasCache());
    console.log(this.entityUserAvatarQuery);

  }

}
