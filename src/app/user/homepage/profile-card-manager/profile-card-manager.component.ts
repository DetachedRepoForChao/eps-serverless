import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar.service';
import {Globals} from '../../../globals';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {PointItemService} from '../../../shared/point-item.service';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card-manager',
  templateUrl: './profile-card-manager.component.html',
  styleUrls: ['./profile-card-manager.component.css']
})
export class ProfileCardManagerComponent implements OnInit {

  constructor(private http: HttpClient,
              private imageService: ImageService,
              public avatarService: AvatarService,
              public globals: Globals,
              private leaderboardService: LeaderboardService,
              public pointItemService: PointItemService) { }

  ngOnInit() {
    this.avatarService.refreshUserAvatar(localStorage.getItem('userId'));
    this.pointItemService.storeRemainingPointPool();
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }
}
