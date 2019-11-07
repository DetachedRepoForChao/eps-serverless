import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../../globals';
import {AchievementComponent} from '../../../shared/achievement/achievement.component';
import {AchievementService} from '../../../shared/achievement/achievement.service';
import {AuthService} from '../../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {EntityUserService} from '../../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../../entity-store/user/state/entity-user.query';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {Department} from '../../../shared/department.model';
import {SecurityRole} from '../../../shared/securityrole.model';
import {forkJoin, Observable} from 'rxjs';
import {DepartmentService} from '../../../shared/department.service';
import {SecurityRoleService} from '../../../shared/securityRole.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent implements OnInit {


  constructor() { }

  ngOnInit() {

  }
}
