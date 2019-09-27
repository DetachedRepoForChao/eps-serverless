import { MetricsStore } from './metrics.store';
import { MetricsQuery} from './metrics.query';
import { createMetricsModel, MetricsModel } from './metrics.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/metrics-filter.model';
import {guid, ID} from '@datorama/akita';
import { cacheable} from '@datorama/akita';
import {API, Auth, Storage} from 'aws-amplify';
import {forkJoin, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Globals} from '../../../globals';
import awsconfig from '../../../../aws-exports';
import {AuthService} from '../../../login/auth.service';
import {createEntityUserAvatarModel, EntityUserModel} from '../../user/state/entity-user.model';
import {store} from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  componentName = 'store-item.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private metricsStore: MetricsStore,
              private metricsQuery: MetricsQuery,
              private globals: Globals,
              private authService: AuthService) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.metricsStore.update({
      ui: {
        filter
      }
    });
  }


  add(itemId: number, name: string, description: string, cost: number, imagePath: string) {
    const metrics = createMetricsModel({itemId, name, description, cost, imagePath});
    this.metricsStore.add(metrics);
  }

  delete(id: ID) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: delete ${id}`);
    this.metricsStore.remove(id);
  }

  reset() {
    this.metricsStore.reset();
  }

  update(itemId: number, name: string, description: string, cost: number, imagePath: string) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: update ${name}`);
    /** Update All */
    this.metricsStore.update((e) => e.itemId === itemId, {
      name: name,
      description: description,
      cost: cost,
      imagePath: imagePath
    });
  }

  getMetrics(): Observable<any> {
    const functionName = 'getMetrics';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/getMetrics', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving user store items data from API`);
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

  cacheMetrics() {
    const functionName = 'cacheMetrics';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getMetrics()
      .pipe(tap((metrics: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(metrics);

        const metricsModels: MetricsModel[] = [];

        for (let i = 0; i < metrics.length; i++) {
          const itemId = metrics[i].itemId;
          const name = metrics[i].name;
          const description = metrics[i].description;
          const cost = metrics[i].cost;
          const imagePath = metrics[i].imagePath;
          const imageResolvedUrl = metrics[i].imageResolvedUrl;
          const metricsModel = createMetricsModel({itemId, name, description, cost, imagePath, imageResolvedUrl});
          metricsModels.push(metricsModel);
        }

        this.metricsStore.set(metricsModels);
      }));

    return cacheable(this.metricsStore, request$);
  }
}
