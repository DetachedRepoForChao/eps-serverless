import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {ImageService} from '../../../shared/image.service';
import {AvatarService} from '../../../shared/avatar.service';
import {Globals} from '../../../globals';
import {LeaderboardService} from '../../../shared/leaderboard.service';
import {PointItemService} from '../../../shared/point-item.service';
import {NgxSpinnerService} from 'ngx-spinner';

// Create a variable to interact with jquery
declare var $: any;

@Component({
  selector: 'app-profile-card-manager',
  templateUrl: './profile-card-manager.component.html',
  styleUrls: ['./profile-card-manager.component.css']
})
export class ProfileCardManagerComponent implements OnInit {
  componentName = 'profile-card-manager.component';
  isImageLoading: boolean;
  isCardLoading: boolean;

  constructor(private http: HttpClient,
              private imageService: ImageService,
              public avatarService: AvatarService,
              public globals: Globals,
              private leaderboardService: LeaderboardService,
              public pointItemService: PointItemService,
              private spinner: NgxSpinnerService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    this.isCardLoading = true;
    this.isImageLoading = true;
    this.spinner.show('profile-card-manager-spinner');

    // this.avatarService.refreshCurrentUserAvatar().subscribe();
    // this.pointItemService.storeRemainingPointPool();

    const observables: Observable<any>[] = [];

    /*    for (let i = 0; i < leaderboardUsers.length; i++) {
          observables.push(this.avatarService.resolveAvatar(leaderboardUsers[i]));
        }*/

    observables.push(this.pointItemService.storeRemainingPointPool());
    observables.push(this.avatarService.refreshCurrentUserAvatar());

    forkJoin(observables)
      .subscribe(obsResults => {
        console.log(`${functionFullName}: obsResults:`);
        console.log(obsResults);

        // Iterate over the returned values from the observables so we can act appropriately on each
        obsResults.forEach(obsResult => {
          console.log(`${functionFullName}: obsResult:`);
          console.log(obsResult);
        });

        this.isImageLoading = false;
        this.isCardLoading = false;
        this.spinner.hide('profile-card-manager-spinner');
      });
  }

  showGallery() {
    $('#imageSelectorModal').modal({backdrop: 'static'});

  }
}
