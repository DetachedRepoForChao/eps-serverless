import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Achievement} from './achievement.model';
import awsconfig from '../../../aws-exports';
import {AuthService} from '../../login/auth.service';
import {AchievementProgress} from './achievement-progress.model';

export interface AchievementItem {
  Name: string;
  Description: string;
  Cost: number;
  Progress: number;
  ProgressId: string;
  AchievementStatus: string;
  ProgressStatus: string;
  Family: string;
}


@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  componentName = 'achievement.service';

  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  achievements: Achievement[];

  constructor(private http: HttpClient,
              private authService: AuthService) {

  }


}
