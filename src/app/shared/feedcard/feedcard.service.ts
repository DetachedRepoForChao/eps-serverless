import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {API} from 'aws-amplify';
import awsconfig from '../../../aws-exports';
import {AuthService} from '../../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeedcardService implements OnInit {
  componentName = 'feedcard.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  // apiName = "api9819f38d";
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': "application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      'Content-Type': "application/json;charset=UTF-8"
    }
  };

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
  }

  async getPointTransaction() {
    const functionName = 'getPointTransaction';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const user = await this.authService.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    this.myInit.headers['Authorization'] = token;

    return API.get(this.apiName, this.apiPath + '/getPointTransaction', this.myInit).then(data => {
      console.log(`${functionFullName}: successfully retrieved data from API`);
      console.log(data);
      return data.data;
    });
  }

  addLike(sourceUserId, targetUserId, postId) {
    const functionName = 'addLike';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: GetLike`);
    return this.http.post(environment.apiBaseUrl + 'likeManage', {'sourceUserId': sourceUserId,
      'targetUserId': targetUserId, 'postId': postId});
  }

}
