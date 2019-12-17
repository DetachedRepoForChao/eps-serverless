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
import {createEntityUserModel, EntityUserModel} from '../../user/state/entity-user.model';
import {store} from '@angular/core/src/render3';
import {EntityCurrentUserQuery} from '../../current-user/state/entity-current-user.query';
import {TimerObservable} from 'rxjs-compat/observable/TimerObservable';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  componentName = 'metrics.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  private homepageTimerAlive: boolean; // used to unsubscribe from the TimerObservable
  // when OnDestroy is called.
  private interval = 10000;

  constructor(private metricsStore: MetricsStore,
              private metricsQuery: MetricsQuery,
              private globals: Globals,
              private authService: AuthService,
              private currentUserQuery: EntityCurrentUserQuery) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.metricsStore.update({
      ui: {
        filter
      }
    });
  }


/*  add(itemId: number, name: string, description: string, cost: number, imagePath: string) {
    const metrics = createMetricsModel({itemId, name, description, cost, imagePath});
    this.metricsStore.add(metrics);
  }*/

  delete(id: ID) {
    // const functionName = 'delete';
    // const functionFullName = `${this.componentName} ${functionName}`;
    // console.log(`Start ${functionFullName}`);

    // console.log(`${functionFullName}: delete ${id}`);
    this.metricsStore.remove(id);
  }

  reset() {
    this.metricsStore.reset();
  }

/*  update(itemId: number, name: string, description: string, cost: number, imagePath: string) {
    const functionName = 'update';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: update ${name}`);
    /!** Update All *!/
    this.metricsStore.update((e) => e.itemId === itemId, {
      name: name,
      description: description,
      cost: cost,
      imagePath: imagePath
    });
  }*/

/*  getMetrics(): Observable<any> {
    const functionName = 'getMetrics';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.currentUserQuery.getCurrentUser()
        .subscribe(currentUser => {
          console.log(currentUser);
          observer.next(currentUser);
          observer.complete();
        });
    });
  }*/



/*  startHomepageTimer() {
    const functionName = 'startHomePageTimer';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    // Start the timer if it hasn't already been started
    if (!(this.homepageTimerAlive)) {
      this.metricsStore.update(null, {
        homepageTimerStart: Date.now(),
      });

      this.homepageTimerAlive = true;

      TimerObservable.create(0, this.interval)
        .takeWhile(() => this.homepageTimerAlive)
        .subscribe(() => {
          const timerStart = this.metricsQuery.getAll()[0].homepageTimerStart;
          const elapsedTime = Date.now() - timerStart;
          this.metricsStore.update(null, {
            homepageSeconds: elapsedTime
          });
        });
    } else {
      console.log(`${functionFullName}: Timer has already been started`);
    }
  }*/

/*  cacheMetrics() {
    const functionName = 'cacheMetrics';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);


    const request$ = this.currentUserQuery.selectCurrentUser()
      .pipe(tap((currentUser: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(currentUser[0]);
        const userId = currentUser[0].userId;
        const metricsModels: MetricsModel[] = [];
        const metricsModel = createMetricsModel({userId});
        metricsModels.push(metricsModel);

        this.metricsStore.set(metricsModels);
      }));

    return cacheable(this.metricsStore, request$);
  }*/
}
