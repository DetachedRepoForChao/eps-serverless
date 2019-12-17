import {Injectable} from '@angular/core';
import { Department } from './department.model';
import {SelectionModel} from '@angular/cdk/collections';
import {forkJoin, Observable} from 'rxjs';
import Amplify, {API} from 'aws-amplify';
import awsconfig from '../../aws-exports';
import {AuthService} from '../login/auth.service';
import {DepartmentService} from './department.service';

// Create a variable to interact with jquery
declare var $: any;

export interface LeaderboardUser {
  rank: number;
  id: number;
  username: string;
  name: string;
  email: string;
  position: string;
  points: number;
  avatar: string;
  department: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  componentName = 'leaderboard.service';
  departments: Department[];

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };


  public leaderboardUsers: LeaderboardUser[];

  selection = new SelectionModel<LeaderboardUser>(true, []);

  constructor(private departmentService: DepartmentService,
              private authService: AuthService,) { }


  getPointsLeaderboard(): Observable<any> {
    // const functionName = 'getPointsLeaderboard';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getPointsLeaderboard', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          });
        });
    });
  }

}
