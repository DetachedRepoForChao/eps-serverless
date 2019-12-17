import { Component, OnInit, TestabilityRegistry, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import {AllCommunityModules, Module} from '@ag-grid-community/all-modules';
import { AgGridAngular } from '@ag-grid-community/angular';
import { DepartmentService } from '../../../../shared/department.service';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import { GridApi } from 'ag-grid-community';



@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  users:  any;
  departments : any;
  user2: any;
  userEntity: string;
  reportUsers$: any;
  public gridApi;
  public rowClassRules;
  public modules: Module[] = AllCommunityModules;
  private gridColumnApi;





  constructor(
    public globals: Globals,
    public entityCurrentUserQuery: EntityCurrentUserQuery,
    public achievementQuery: AchievementQuery,
    public entityuserQuery: EntityUserQuery,
    public departmentService: DepartmentService,


  ) {
    this.rowClassRules = {
      "points-warning": function(params) {
        var points = params.data.points;
        return points > 1000 && points <= 3000;
      },
      "points-breach": "data.points > 6000"
    };
  }

  ngOnInit() {
    this.entityuserQuery.selectHasCache()
    .subscribe(result => {
      if (result) {
        this.users = this.entityuserQuery.getAll();
            // tslint:disable-next-line: forin
        // console.log(this.users)
        var strMap = [];
        let dp = new Map();
        let mapu = new Map();
          for ( let i = 0; i < this.users.length; i++){
              this.departments = this.departmentService.getDepartmentById(this.users[i].departmentId)
              // console.log(this.departments)
              // console.log(this.users[i].department.Name)
              mapu[i]={
                'username' : this.users[i].username,
                'points':this.users[i].points,
                'position':this.users[i].position,
                'lastName':this.users[i].lastName,
                'email':this.users[i].email,
                'phoneNumber':this.users[i].phoneNumber,
                'department':this.users[i].department.Name,
                'role':this.users[i].securityRole.Name
                // 'departmentName':
              }
              strMap.push(mapu[i])
              // tslint:disable-next-line: whitespace
          }
      this.rowData = strMap;
      // console.log(strMap);
      }
    });
  }

  // tslint:disable-next-line: member-ordering
  columnDefs = [
    {
      headerName:'USER INFO',
      children:[
        {headerName: 'Username', field: 'username', sortable: true, filter: true,checkboxSelection: true,},
        {headerName: 'Points', field: 'points', sortable: true, filter: true,editable: true},
        {headerName: 'Positions', field: 'position', sortable: true, filter: true},
      ]
    },
    {
      headerName:'CONTACT INFO',
      children:
      [
        {headerName: 'LastName', field: 'lastName', sortable: true, filter: true},
        {headerName: 'Email', field: 'email', sortable: true, filter: true},
        {headerName: 'PhoneNumber', field: 'phoneNumber', sortable: true, filter: true},
      ]
    },
    {
      headerName:'OFFICE INFO',
      children:
      [
        {headerName: 'department', field: 'department', sortable: true, filter: true},
        {headerName: 'role', field: 'role', sortable: true, filter: true}
      ]
    }
];

// tslint:disable-next-line: member-ordering
showToolPanel = {
  toolPanels: [
    {
      id: "columns",
      labelDefault: "Columns",
      labelKey: "columns",
      iconKey: "columns",
      toolPanel: "agColumnsToolPanel",
      toolPanelParams: {
        toolPanelSuppressRowGroups: true,
        toolPanelSuppressValues: true,
        toolPanelSuppressPivots: true,
        toolPanelSuppressPivotMode: true
      }
    }
  ]
};

  // tslint:disable-next-line: member-ordering



  // tslint:disable-next-line: member-ordering
  rowData: any ;

  getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    const selectedDataStringPresentation = selectedData.map( node => node.username + ' ' + node.points).join(', ');
    alert(`Selected nodes: ${selectedDataStringPresentation}`);
}
  // tslint:disable-next-line: member-ordering

  onBtExport() {
    var params={
        fileName: document.querySelector('#fileName').textContent,
    }
    this.gridApi.exportDataAsCsv(params);
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  // tslint:disable-next-line: member-ordering

}
