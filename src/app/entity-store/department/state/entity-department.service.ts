import { EntityDepartmentStore } from './entity-department.store';
import { EntityDepartmentQuery } from './entity-department.query';
import { createEntityDepartmentModel, EntityDepartmentModel } from './entity-department.model';
import { Injectable } from '@angular/core';
import { VISIBILITY_FILTER } from '../filter/department-filter.model';
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
export class EntityDepartmentService {

  componentName = 'EntityDepartment.service';
  apiName = awsconfig.aws_cloud_logic_custom[0].name;
  apiPath = '/items';
  myInit = {
    headers: {
      'Accept': 'application/hal+json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };

  constructor(private entityDepartmentStore: EntityDepartmentStore,
              private entityDepartmentQuery: EntityDepartmentQuery,
              private globals: Globals,
              private authService: AuthService) {
  }

  updateFilter(filter: VISIBILITY_FILTER) {
    this.entityDepartmentStore.update({
      ui: {
        filter
      }
    });
  }


  add(name: string,departmentId:number) {
    const department = createEntityDepartmentModel({name,departmentId});
    console.log(department)
    this.entityDepartmentStore.add(department);
  }


  delete(id: ID) {
    const functionName = 'delete';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`${functionFullName}: delete ${id}`);
    this.entityDepartmentStore.remove(id);
  }

  addDepartment(department): Observable<any> {
    const functionName = 'addDepartment';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            department: department
          };

          API.post(this.apiName, this.apiPath + '/addDepartments', myInit).then(addDepartmentResult => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(addDepartmentResult);
            if (addDepartmentResult.data.status !== false) {
              const id = addDepartmentResult.data.newDepartment.departmentId;
              const name = addDepartmentResult.data.newDepartment.departmentName;

              this.add(name,id);
              observer.next(addDepartmentResult.data);
              observer.complete();
            } else {
              observer.next(addDepartmentResult.data);
              observer.complete();
            }
          });
        });
    });
  }

  getEntityDepartmemt(): Observable<any> {
    const functionName = 'getEntityDepartment';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(user => {
          const token = user.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          API.get(this.apiName, this.apiPath + '/departments', myInit).then(data => {
            console.log(`${functionFullName}: successfully retrieved data from API`);
            console.log(data);
            observer.next(data.data);
            observer.complete();
          })
            .catch(err => {
              console.log(`${functionFullName}: error retrieving departments data from API`);
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

  deleteDepartment(department): Observable<any> {
    const functionName = 'deleteDepartment';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return new Observable<any>(observer => {
      this.authService.currentAuthenticatedUser()
        .then(currentUser => {
          const token = currentUser.signInUserSession.idToken.jwtToken;
          const myInit = this.myInit;
          myInit.headers['Authorization'] = token;

          myInit['body'] = {
            department:department
          };

          API.post(this.apiName, this.apiPath + '/deleteDepartment', myInit).then(deleteDepartmentResult => {
            console.log(`${functionFullName}: data retrieved from API`);
            console.log(deleteDepartmentResult);

            if (deleteDepartmentResult.data.status !== false) {

              const id = deleteDepartmentResult.data.department.departmentId;
              this.delete(id);
              observer.next(deleteDepartmentResult.data);
              observer.complete();
            } else {
              observer.next(deleteDepartmentResult.data);
              observer.complete();
            }
          });
        });
    });
  }


  cacheEntityDepartments() {
    const functionName = 'cacheEntityDepartments';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    const request$ = this.getEntityDepartmemt()
      .pipe(tap((entityDepartments: any) => {
        console.log(`${functionFullName}: caching:`);
        console.log(entityDepartments);

        const EntityDepartmentsArray: EntityDepartmentModel[] = [];

        for (let i = 0; i < entityDepartments.length; i++) {
          const departmentId = entityDepartments[i].feature.id;
          const name = entityDepartments[i].feature.name;
          const feature = createEntityDepartmentModel({departmentId, name});
          EntityDepartmentsArray.push(feature);
        }

        this.entityDepartmentStore.set(EntityDepartmentsArray);
      }));

    return cacheable(this.entityDepartmentStore, request$);
  }
}
