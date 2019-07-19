import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar.service';
import {GALLERY_IMAGE} from 'ngx-image-gallery';
import {Globals} from '../../../globals';
import {LeaderboardService} from '../../../shared/leaderboard.service';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {

  isImageLoading: boolean;
  userLeaderboardRecord;

  constructor(private http: HttpClient,
              private imageService: ImageService,
              private avatarService: AvatarService,
              public globals: Globals,
              public leaderboardService: LeaderboardService) { }

  ngOnInit() {
      const text_max = 200;
    $('#count_message').html(text_max + ' remaining');

    $('#text').keyup(function() {
      const text_length = $('#text').val().length;
      const text_remaining = text_max - text_length;

      $('#count_message').html(text_remaining + ' remaining');
    });

    this.leaderboardService.getUserPointsLeaderboardRecord(+localStorage.getItem('userId'))
      .then(userLeaderboardRecord => {
        this.userLeaderboardRecord = userLeaderboardRecord;
      });
    this.avatarService.refreshUserAvatar(+localStorage.getItem('userId'));
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }
}
