import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntityUserService } from '../../../../entity-store/user/state/entity-user.service';
import { User } from 'src/app/shared/user.model';
import { AchievementQuery } from 'src/app/entity-store/achievement/state/achievement.query';
import { EntityCurrentUserQuery } from 'src/app/entity-store/current-user/state/entity-current-user.query';
import { EntityUserQuery } from 'src/app/entity-store/user/state/entity-user.query';
import { Globals } from 'src/app/globals';
import { EntityUserModel } from 'src/app/entity-store/user/state/entity-user.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  public user:  String;

  ngOnInit() {
    this.entityuserService.cacheUsers().subscribe();
    this.user = this.globals.getUsername();
    console.log(this.user)
    this.rowData.value = [this.user.toString()]

  }

  constructor(
    public globals: Globals,
    public entityCurrentUserQuery: EntityCurrentUserQuery,
    public achievementQuery: AchievementQuery,
    public entityuserService: EntityUserService,
    public entityuserQuery: EntityUserQuery,
  ) {}

  title = 'app';

  columnDefs = [
      {headerName: 'UserName', field: 'UserName' , sortable: true, filter: true },
  ];
  rowData: any;
}
