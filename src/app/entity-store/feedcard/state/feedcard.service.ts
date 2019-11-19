import { FeedcardStore } from './feedcard.store';
import { FeedcardQuery} from './feedcard.query';
import { createFeedcardModel, FeedcardModel } from './feedcard.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/feedcard-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import { create } from 'domain';

@Injectable({
  providedIn: 'root'
})
export class FeedcardService {
  componentName = 'feedcard.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(
    private feedcardStore: FeedcardStore,
    private feedcardQuery: FeedcardQuery,
    private globals: Globals,
    private authService: AuthService) {

  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.feedcardStore.update({
      ui: {
        filter
      }
    });
  }

  add(feedcardId: number, createAt: any, createUser: string, description: string) {
    const feedcard = createFeedcardModel({feedcardId, createAt, createUser, description});
  }

  // delete(id: ID) {
  //   const functionName = 'delete';
  //   const functionFullName = `${this.componentName} ${functionName}`;
  //   console.log(`Start ${functionFullName}`);

  //   console.log(`${functionFullName}: delete ${id}`);
  //   this.featureStore.remove(id);
  // }

  delete(id:ID){
    const functionName = 'delete';
    const functionFullName = '${this.componentName} ${functionName}';
    console.log('start ${functionFullName}');
    console.log(`${functionFullName}: delete ${id}`);
    this.feedcardStore.remove(id);
  }

  reset() {
    this.feedcardStore.reset();
  }

  modify(feedcardId:number,description:string,createAt:string,createUser:string){
    const functionName = 'delete';
    const functionFullName = '${this.componentName} ${functionName}';
    console.log('start ${functionFullName}');
    console.log(`${functionFullName}: update ${feedcardId}`);

    this.feedcardStore.update((e)=>e.feedcardID==feedcardId,{
      description:description,
      createAt:create,
      createUser:createUser
    })
  }

  getFeedcards(): Observable<any> {
    const functionName = 'getFeedcards';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/feedcards', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving features data from API`);
              console.log(err);
              observer.next(err);
              observer.complete();
            });
        })
        .catch(err => {
          console.log(`${functionFullName}: error getting current authenticated user from auth service`);
          console.log(err);
          observer.next(err);
          observer.complete();
        });
    });
  }

  cacheFeatures() {
    const functionName = 'cacheFeedcardss';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getFeedcards()
      .pipe(tap((feedcards: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(feedcards);

        const feedcardsArray: FeedcardModel[] = [];

        for (let i = 0; i < feedcards.length; i++) {
          const feedcardId = feedcards[i].feedcard.id;
          const description = feedcards[i].feedcard.description;
          const createAt = feedcards[i].feedcard.id;
          const createUser = feedcards[i].createUser;
          const feedcard = createFeedcardModel({feedcardId,description,createAt,createUser});
          feedcardsArray.push(feedcard);
        }

        this.feedcardStore.set(feedcardsArray);
      }));

    return cacheable(this.feedcardStore, request$);
  }


}

