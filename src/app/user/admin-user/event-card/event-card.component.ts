import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { Globals} from '../../../globals';
import {AuthService} from '../../../login/auth.service';
import {resetStores} from '@datorama/akita';
import {EntityDepartmentService} from '../../../entity-store/department/state/entity-department.service';
import {EntityDepartmentQuery} from '../../../entity-store/department/state/entity-department.query';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {tap} from 'rxjs/operators';
import {Department} from '../../../shared/department.model';
import {forkJoin, Observable} from 'rxjs';
import {DepartmentService} from '../../../shared/department.service';
import {NotifierService} from 'angular-notifier';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent implements OnInit {
    componentName = 'event-card.component';
    public config: PerfectScrollbarConfigInterface = {};
    zipPattern = new RegExp(/^\d{5}(?:\d{2})?$/);
    phoneValidationError: string;
    addDepartmentForm: FormGroup;
    addDepartmentFormSubmitted = false;
    deleteDepartmentForm: FormGroup;
    deleteDepartmentFormSubmitted = false;
    departments;
    securityRoles;

    ngOnInit() {
              this.departmentService.getDepartments().subscribe();
              // Read in the list of departments from the DepartmentService
              const departments$ = this.departmentService.getDepartments()
              .pipe(
                tap((departments: Department[]) => {
                  this.departments = departments;
                })
              );

              const observables: Observable<any>[] = [];
              observables.push(departments$);

              forkJoin(observables)
                  .subscribe(() => {
                  });

              this.loadAddDepartmentForm();
              this.loadDeleteDepartmentForm();
    }


  constructor(
              public  globals: Globals,
              private router: Router,
              private EntitydepartmentService: EntityDepartmentService,
              private authService: AuthService,
              private EntitydepartmentQuery: EntityDepartmentQuery,
              private formBuilder: FormBuilder,
              private departmentService: DepartmentService,
              private notifierService: NotifierService) { }


  private loadAddDepartmentForm() {
                  this.addDepartmentForm = this.formBuilder.group({
                  departmentName: [null],
                });
              }

  private loadDeleteDepartmentForm() {
                this.deleteDepartmentForm = this.formBuilder.group({
                  departmentName: [null],
                });
              }

  onAddDepartmentFormSubmit(form: FormGroup) {
                console.log(form);
                this.addDepartmentFormSubmitted= true;

                const department = {};
                const keys = Object.keys(form.controls);

                console.log(department);

                if (!form.invalid) {
                  for (let i = 0; i < keys.length; i++) {
                    department[keys[i]] = form.controls[keys[i]].value;
                  }
                    this.EntitydepartmentService.addDepartment(department).subscribe(addResult => {
                      console.log(addResult);
                        if (addResult.status !== false) {
                            this.notifierService.notify('success', 'department record added successfully.');
                            this.addDepartmentFormSubmitted = false;
                            } else {
                            this.notifierService.notify('error', `Submission error: ${addResult.message}`);
                            }
                          });
                        console.log(department);
                        } else {
                            console.log('The form submission is invalid');
                            this.notifierService.notify('error', 'Please fix the errors and try again.');
                }
              }
              // this.pointItemService.newPointItem(pointItem).subscribe(addResult => {
              //   console.log(addResult);
              //   if (addResult.status !== false) {
              //     this.notifierService.notify('success', 'Point item record added successfully.');
              //     this.addPointItemFormSubmitted = false;
              //   } else {
              //     this.notifierService.notify('error', `Submission error: ${addResult.message}`);
              //   }
              // });


  onDeleteDepartmentFormSubmit(form: FormGroup) {
                console.log(form);
                this.deleteDepartmentFormSubmitted = true;

                let department = {};

                console.log(department);

                if (!form.invalid) {
                  department = form.controls.department.value;
                  this.EntitydepartmentService.deleteDepartment(department).subscribe(deleteResult => {
                    console.log(deleteResult);
                    if (deleteResult.status !== false) {
                      this.notifierService.notify('success', 'department record deleted successfully.');
                      this.deleteDepartmentFormSubmitted = false;
                    } else {
                      this.notifierService.notify('error', `Submission error: ${deleteResult.message}`);
                    }
                  });

                  console.log(department);
                } else {
                  console.log('The form submission is invalid');
                  this.notifierService.notify('error', 'Please fix the errors and try again.');
                }
              }
}
