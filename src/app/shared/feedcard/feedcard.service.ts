import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FeedcardService implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  getPointTransaction() {
    console.log('GetPointTransaction:');
    return  this.http.get(environment.apiBaseUrl + '/getpointtransaction');
  }

  addLike(sourceUserId, targetUserId, postId) {
    console.log('GetLike');
    return this.http.post(environment.apiBaseUrl + 'likeManage', {'sourceUserId': sourceUserId,
      'targetUserId': targetUserId, 'postId': postId});
  }

}
