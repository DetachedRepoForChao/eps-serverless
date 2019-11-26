import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { SecurityRole } from './securityrole.model';
// import { environment } from '../../environments/environment';
// import { User } from './user.model';
import { Department} from '../../../shared/department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {forkJoin, Observable} from 'rxjs';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {DepartmentService} from '../../../shared/department.service';
import {DepartmentEmployee} from './gift-points.component';
import {LeaderboardUser} from '../../../shared/leaderboard.service';

// Create a variable to interact with jquery
declare var $: any;

export interface DepartmentEmployee {
  id: number;
  avatar: string;
  name: string;
  username: string;
  email: string;
  position: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class GiftPointsService {
  componentName = 'gift-points-service.service';
  departments: Department[];

  public departmentEmployees: DepartmentEmployee[] = [];
  department: Department;
  displayedColumns: string[] = ['select', 'avatar', 'name', 'username', 'email', 'position', 'points'];
  selection = new SelectionModel<DepartmentEmployee>(true, []);
  dataSource = new MatTableDataSource<DepartmentEmployee>();
  pointItemList = [];
  selectedPointItem = {};
  selectedEmployees = [];

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private http: HttpClient,
              private departmentService: DepartmentService,
              private authService: AuthService) { }


}
