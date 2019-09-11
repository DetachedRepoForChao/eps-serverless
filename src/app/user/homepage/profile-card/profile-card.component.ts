import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar.service';
import {GALLERY_IMAGE} from 'ngx-image-gallery';
import {Globals} from '../../../globals';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {UserService} from '../../../shared/user.service';
import {NgForm} from "@angular/forms";

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {

  isImageLoading: boolean;
  userDetails: any = '';
  quote: string;
    
  constructor(private http: HttpClient,
              private imageService: ImageService,
              private avatarService: AvatarService,
              private globals: Globals,
              private leaderboardService: LeaderboardService,
              private userService: UserService) { }

  ngOnInit() {
      const text_max = 200;
    $('#count_message').html(text_max + ' remaining');

    $('#text').keyup(function() {
      const text_length = $('#text').val().length;
      const text_remaining = text_max - text_length;

      $('#count_message').html(text_remaining + ' remaining');
    });

    this.leaderboardService.getUserPointsLeaderboardRecord(+localStorage.getItem('userId'));
    this.avatarService.refreshUserAvatar(localStorage.getItem('userId'));
    this.userService.getUserProfile()
    .subscribe ((result: any) => {
        console.log('result from get user profile');
        console.log(result);
        this.userDetails = result.user;
    });
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }
    submitQuote(form: NgForm){
        console.log(form);
        console.log(form.value['text']);
        console.log('userId: ' + (+localStorage.getItem('userId')));
        this.userService.setUserQuote(form.value['text'], +localStorage.getItem('userId'))
        .subscribe( result =>{
            this.userService.getUserProfile()
                .subscribe((getUserProfileResult: any) =>{
                console.log('result from getUserProfile');
                 console.log(getUserProfileResult);
                this.userDetails = getUserProfileResult.user;
            });
            
        });
    }
}
