import { FeatureStore } from './feature.store';
import { FeatureQuery} from './feature.query';
import { createFeatureModel, FeatureModel } from './feature.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/feature-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  componentName = 'feature.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private featureStore: FeatureStore,
              private featureQuery: FeatureQuery,
              private globals: Globals,
              private authService: AuthService) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.featureStore.update({
      ui: {
        filter
      }
    });
  }


  add(featureId: number, name: string, description: string, achievementId: number, unlockDescription: string) {
    const feature = createFeatureModel({featureId, name, description, achievementId, unlockDescription});
    this.featureStore.add(feature);
  }


  delete(id: ID) {
    // const functionName = 'delete';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: delete ${id}`);
    this.featureStore.remove(id);
  }

  reset() {
    this.featureStore.reset();
  }

  update(featureId: number, name: string, description: string, achievementId: number, unlockDescription: string) {
    // const functionName = 'update';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: update ${name}`);
    /** Update All */
    this.featureStore.update((e) => e.featureId === featureId, {
      name: name,
      description: description,
      achievementId: achievementId,
      unlockDescription: unlockDescription,
    });
  }

  getFeatures(): Observable<any> {
    // const functionName = 'getFeatures';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/features', myInit).then(data => {
            // console.log(`${functionFullName}: successfully retrieved data from API`);
            // console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              // console.log(`${functionFullName}: error retrieving features data from API`);
              // console.log(err);
              observer.next(err);
              observer.complete();
            });
        })
        .catch(err => {
          // console.log(`${functionFullName}: error getting current authenticated user from auth service`);
          // console.log(err);
          observer.next(err);
          observer.complete();
        });
    });
  }


  cacheFeatures() {
    // const functionName = 'cacheFeatures';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    const request$ = this.getFeatures()
      .pipe(tap((features: any) => {
        // console.log(`${functionFullName}: caching:`);
        // console.log(features);

        const featuresArray: FeatureModel[] = [];

        for (let i = 0; i < features.length; i++) {
          const featureId = features[i].feature.id;
          const name = features[i].feature.name;
          const description = features[i].feature.description;
          const achievementId = features[i].achievement.id;
          const unlockDescription = features[i].description;
          const feature = createFeatureModel({featureId, name, description, achievementId, unlockDescription});
          featuresArray.push(feature);
        }

        this.featureStore.set(featuresArray);
      }));

    return cacheable(this.featureStore, request$);
  }
}
