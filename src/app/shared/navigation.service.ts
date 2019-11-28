import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import {Router} from '@angular/router';
import {EntityUserModel} from '../entity-store/user/state/entity-user.model';

declare var $: any;

@Injectable({ providedIn: 'root' })
export class NavigationService {
  public pointItemComponentInputUser: EntityUserModel;
  public pointItemModalActive = false;
  public achievementComponentInputUser: EntityUserModel;
  public achievementModalActive = false;


  constructor(private router: Router) {
  }

  openPointItemModal() {
    console.log('opening point-item modal');
    console.log(`navigation service component... showing #pointItemModal with the following user input:`);
    console.log(this.pointItemComponentInputUser);
    this.pointItemModalActive = true;
    $('#pointItemModal').modal('show');
  }


  closePointItemModal() {
    console.log('closing point-item modal');
    this.pointItemModalActive = false;
    $('#pointItemModal').modal('hide');
  }

  openAchievementModal() {
    console.log('opening achievement modal');
    console.log(`navigation service component... showing #achievementModal with the following user input:`);
    console.log(this.achievementComponentInputUser);
    this.achievementModalActive = true;
    $('#achievementModal').modal('show');
  }

  closeAchievementModal() {
    console.log('closing achievement modal');
    this.achievementModalActive = false;
    $('#achievementModal').modal('hide');
  }

  navigateToProfile(username) {
    console.log(`navigate to /user/profile/${username}`);
    this.router.navigate(['/', 'user', 'profile', username]).then();

  }

}
