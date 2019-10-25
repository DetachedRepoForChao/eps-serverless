import { Component, OnInit } from '@angular/core';
import {CurrentUserStore} from '../../entity-store/current-user/state/current-user.store';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';


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
                public currentUserQuery: EntityCurrentUserQuery) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);


   


  }
  test() {

  }

}
