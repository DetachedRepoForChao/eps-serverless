import { Injectable } from '@angular/core';
import {AchievementService} from '../achievement/achievement.service';

// Create a variable to interact with jquery
declare var $: any;

export interface Trophy {
  id: number;
  name: string;
  description: string;
  status: string;
  cost: number;
  progress: number;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TrophyService {

  trophyList: Trophy[];

  constructor(private achievementService: AchievementService) { }

  populateTrophyList() {

  }
}
