import { Component, OnInit } from '@angular/core';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';



  import { from } from 'rxjs';

  declare var $: any;

@Component({
  selector: 'app-confirm-item-purchase',
  templateUrl: './confirm-item-purchase.component.html',
  styleUrls: ['./confirm-item-purchase.component.css']
})
export class ConfirmItemPurchaseComponent implements OnInit {
  componentName = 'confirm-item-purchase.component';


  currentUser$;
  currentUser;

  constructor ( private currentUserStore: CurrentUserStore,
                private entityUserService: EntityUserService,
                public currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);


    this.currentUser$ = this.currentUserQuery.selectAll();
    this.entityUserService.cacheUsers().subscribe();


  }
  test() {

  }

}
