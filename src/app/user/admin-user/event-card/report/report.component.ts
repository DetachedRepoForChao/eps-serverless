import { Component, OnInit, TestabilityRegistry, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntityUserService } from '../../../../entity-store/user/state/entity-user.service';
import { User } from 'src/app/shared/user.model';
import { AchievementQuery } from 'src/app/entity-store/achievement/state/achievement.query';
import { EntityCurrentUserQuery } from 'src/app/entity-store/current-user/state/entity-current-user.query';
import { Globals } from 'src/app/globals';
import { UserStore } from '../../../../entity-store/user/state/user.store';
import { EntityUserQuery} from '../../../../entity-store/user/state/entity-user.query';
import { createEntityUserModel, EntityUserModel } from '../../../../entity-store/user/state/entity-user.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../../../../entity-store/user/filter/user-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap, map} from 'rxjs/operators';
import awsconfig from '../../../../../aws-exports';
import {AuthService} from '../../../../login/auth.service';
import {SecurityRole} from '../../../../shared/securityrole.model';
import {Department} from '../../../../shared/department.model';
import {FormGroup} from '@angular/forms';
import {environment} from '../../../../../environments/environment';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import { AgGridAngular } from '@ag-grid-community/angular';
import { DepartmentService } from '../../../../shared/department.service';




@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  users:  any;
  departments : any;
  user2: any;
  userEntity: string;
  reportUsers$: any;




  constructor(
    public globals: Globals,
    public entityCurrentUserQuery: EntityCurrentUserQuery,
    public achievementQuery: AchievementQuery,
    public entityuserService: EntityUserService,
    public entityuserQuery: EntityUserQuery,
    public departmentService: DepartmentService

  ) {}

  ngOnInit() {
    this.entityuserQuery.selectHasCache()
    .subscribe(result => {
      if (result) {
        this.users = this.entityuserQuery.getAll();
        // this.departments = this.departmentService.getDepartments();
            // tslint:disable-next-line: forin
        var strMap = [];
        let dp = new Map();
        let mapu = new Map();
          for ( let i = 0; i < this.users.length; i++){
              this.user2=this.entityuserService.cacheUsers().subscribe(()=>{
                for (var keys of Object.keys(this.departmentService.getDepartmentById(this.user2[i].departmentId))){
                  console.log(keys)
                }
              })
              console.log(this.user2[i])
              mapu[i]={
                'username' : this.users[i].username,
                'points':this.users[i].points,
                'position':this.users[i].position,
                'lastName':this.users[i].lastName,
                'country':this.users[i].country,
                // 'departmentName':
              }
              strMap.push(mapu[i])
              // tslint:disable-next-line: whitespace
          }
      this.rowData = strMap;
      console.log(strMap);
      } else {
        this.entityuserService.cacheUsers().subscribe(() => {
          this.users = this.entityuserQuery.getAll();
          // console.log(this.users);
          for (const user of this.users) {
            const keys = Object.keys(user);
            for (const key of keys) {
            }
          }
        });
      }
    });
  }

  // tslint:disable-next-line: member-ordering
  columnDefs = [
    // {headerName: 'Username', field: 'username', sortable: true, filter: true,checkboxSelection: true},
    {headerName: 'Points', field: 'points', sortable: true, filter: true},
    {headerName: 'Positions', field: 'position', sortable: true, filter: true},
    {headerName: 'LastName', field: 'lastName', sortable: true, filter: true},
    {headerName: 'Country', field: 'country', sortable: true, filter: true},
    {headerName: 'departments', field: 'departmentName', sortable: true, filter: true}
];

  // tslint:disable-next-line: member-ordering
  autoGroupColumnDef = {
    headerName: 'Username',
    field: 'usernamel',
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true
    }
  };


  // tslint:disable-next-line: member-ordering
  rowData: any ;

  getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    const selectedDataStringPresentation = selectedData.map( node => node.username + ' ' + node.points).join(', ');
    alert(`Selected nodes: ${selectedDataStringPresentation}`);
}

  // tslint:disable-next-line: member-ordering
  modules = AllCommunityModules;
}
