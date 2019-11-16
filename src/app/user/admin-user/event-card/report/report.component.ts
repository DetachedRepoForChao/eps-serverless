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

  public user:  EntityUserModel;
  reportUsers$: Observable<EntityUserModel[]>;

  ngOnInit() {



    // reportUser$.subscribe(reportUser => {
    //   console.log(reportUser);
    // });
  }

  constructor(
    public globals: Globals,
    public entityCurrentUserQuery: EntityCurrentUserQuery,
    public achievementQuery: AchievementQuery,
    public entityuserService: EntityUserService,
    public entityuserQuery: EntityUserQuery,
    private http: HttpClient
  ) {}

  title = 'app';

  columnDefs = [
    {headerName: 'Name', field: 'username', sortable: true, filter: true},
];

  rowData: any;


}
