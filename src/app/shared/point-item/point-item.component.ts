import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Globals} from '../../globals';
import {AchievementService} from '../../entity-store/achievement/state/achievement.service';
import {Router} from '@angular/router';
import {AchievementQuery} from '../../entity-store/achievement/state/achievement.query';
import {FeatureService} from '../../entity-store/feature/state/feature.service';
import {FeatureQuery} from '../../entity-store/feature/state/feature.query';
import {AchievementModel} from '../../entity-store/achievement/state/achievement.model';
import {PointItemService} from '../../entity-store/point-item/state/point-item.service';
import {PointItemQuery} from '../../entity-store/point-item/state/point-item.query';
import {PointItemTransactionService} from '../../entity-store/point-item-transaction/state/point-item-transaction.service';
import {PointItemTransactionQuery} from '../../entity-store/point-item-transaction/state/point-item-transaction.query';
import {EntityCurrentUserService} from '../../entity-store/current-user/state/entity-current-user.service';
import {EntityCurrentUserQuery} from '../../entity-store/current-user/state/entity-current-user.query';
import {Observable, Subject, Subscription} from 'rxjs';
import {Order} from '@datorama/akita';
import {EntityUserService} from '../../entity-store/user/state/entity-user.service';
import {EntityUserQuery} from '../../entity-store/user/state/entity-user.query';
import {Spinner} from 'ngx-spinner/lib/ngx-spinner.enum';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatDialogRef} from '@angular/material';
import {EntityUserModel} from '../../entity-store/user/state/entity-user.model';
import {EntityCurrentUserModel} from '../../entity-store/current-user/state/entity-current-user.model';
import {NavigationService} from '../navigation.service';
import {PointItemTransactionModel} from '../../entity-store/point-item-transaction/state/point-item-transaction.model';
import {PointItemModel} from '../../entity-store/point-item/state/point-item.model';
import {take, takeUntil} from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-point-item',
  templateUrl: './point-item.component.html',
  styleUrls: ['./point-item.component.css']
})
export class PointItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() inputUser: EntityCurrentUserModel;
  @Output() clearInputUser = new EventEmitter<any>();

  componentName = 'point-item.component';
  private unsubscribe$ = new Subject();
  private userLoading$ = new Subject();
  private currentUserLoading$ = new Subject();
  private transactionsLoading$ = new Subject();

  public config: PerfectScrollbarConfigInterface = {};
  pointItems$: Observable<PointItemModel[]>;
  pointItemTransactions$: Observable<PointItemTransactionModel[]>;
  user$: Observable<EntityUserModel[]>;
  user: EntityUserModel;
  currentUser$: Observable<EntityCurrentUserModel[]>;
  currentUser: EntityCurrentUserModel;
  managerUser$: Observable<EntityUserModel[]>;
  managerUser: EntityUserModel;
  currentManager$: Observable<EntityCurrentUserModel[]>;
  currentManager: EntityCurrentUserModel;
  pointItemsTransactionsRetrieving = false;
  pointItemTransactions: PointItemTransactionModel[];
  isUserDataRetrieved = false;
  isCurrentUserDataRetrieved = false;
  isCurrentManagerDataRetrieved = false;
  isManagerDataRetrieved = false;
  isManager = false;
  routerDestination: string[];
  showLimit = 6;

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
              private currentUserService: EntityCurrentUserService,
              private currentUserQuery: EntityCurrentUserQuery,
              private userService: EntityUserService,
              private userQuery: EntityUserQuery,
              private pointItemService: PointItemService,
              private pointItemQuery: PointItemQuery,
              private pointItemTransactionService: PointItemTransactionService,
              private pointItemTransactionQuery: PointItemTransactionQuery,
              private navigationService: NavigationService) { }

  ngOnInit() {
    const functionName = 'ngOnInit';
    const functionFullName = `${this.componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    console.log(`point-item component starting with the following input user:`);
    console.log(this.inputUser);

    this.spinner.show('other-user-spinner');

    /*    this.currentUserService.cacheCurrentUser().subscribe();
        this.userService.cacheUsers().subscribe();
        this.pointItemService.cachePointItems().subscribe();*/
    // this.pointItems$ = this.pointItemQuery.selectAll();

    if (this.inputUser) {
      this.populateUserData();
    } else {
      this.populateCurrentUserData();
    }
    /*
        this.currentUserQuery.selectLoading()
          .pipe(takeUntil(this.currentUserLoading$))
          .subscribe(currentUserQueryLoading => {
            console.log(`Current User loading status is ${currentUserQueryLoading}`);
            if (!currentUserQueryLoading) {
              // this.currentUser$ = this.currentUserQuery.selectAll();

              this.currentUserQuery.selectCurrentUser()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((currentUser: EntityCurrentUserModel) => {
                  console.log('current user:');
                  console.log(currentUser);
                  if (currentUser.securityRole.Id === 2) {
                    // this.populateCurrentManagerPointTransactionData(currentUser);
                    this.currentUser = currentUser;

                    // Pull user info into a static variable if this hasn't happened yet
                    /!*              if (!this.currentUser) {
                                    this.currentUser = this.currentUserQuery.getAll()[0];
                                  }*!/

                    this.isManager = true;
                    // this.isCurrentManagerDataRetrieved = true;
                  } else {
                    // this.populateCurrentUserPointTransactionData(currentUser);
                    this.currentUser = currentUser;

                    this.pointItemTransactionService.cacheCurrentUserPointItemTransactions(currentUser.userId)
                      .pipe(take(1))
                      .subscribe((result: Observable<any> | any) => {
                        if (result !== false) {
                          result
                            .pipe(take(1))
                            .subscribe(() => {
                            });

                        } else {
                          console.log(`Cache User Point Item Transactions returned ${result}`);
                        }
                      });

                    // this.pointItemTransactionQuery.selectHasCache()
                    this.pointItemTransactionService.currentUserTransactionsRetrieved
                      // .pipe(takeUntil(this.pointItemTransactionService.currentUserTransactionsLoading$))
                      .subscribe(isRetrieved => {
                        console.log('current user transactions retrieved: ' + isRetrieved);
                        // console.log('point transactions has cache: ' + isLoading);
                        // console.log('point transactions loading: ' + isLoading);
                        if (isRetrieved) {
                          this.pointItemTransactionQuery.selectAll({
                            filterBy: e => e.targetUserId === currentUser.userId,
                            sortBy: 'createdAt',
                            sortByOrder: Order.DESC
                          })
                            .pipe(takeUntil(this.unsubscribe$))
                            .subscribe((transactions: PointItemTransactionModel[]) => {
                              this.pointItemTransactions = transactions;
                              console.log('point item transactions');
                              console.log(this.pointItemTransactions);
                            });

                          // this.transactionsLoading$.next();
                          // this.transactionsLoading$.complete();
                          this.pointItemTransactionService.currentUserTransactionsLoading$.next();
                          this.pointItemTransactionService.currentUserTransactionsLoading$.complete();
                        }
                      });
                  }

                  this.spinner.hide('point-item-spinner');
                });

              this.currentUserLoading$.next();
              this.currentUserLoading$.complete();
            } else {
              console.log('ERROR: User is still loading');
            }
          });*/



    const parentScope = this;
    $('#pointItemModal').on('hidden.bs.modal',
      function (e) {
        console.log('running on hidden function');
        console.log(e);
        parentScope.inputUser = null;
        parentScope.navigationService.pointItemComponentInputUser = null;
        parentScope.clearInputUser.emit(true);
        parentScope.navigationService.pointItemModalActive = false;
      });
  }


  populateUserPointTransactionData(user: EntityUserModel) {
    console.log('populateUserPointTransactionData for ' + user.userId);
    if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointItemsTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheUserPointItemTransactions(user.userId)
        .pipe(take(1))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            result.pipe(take(1)).subscribe();
          } else {
            console.log(`Cache User Point Item Transactions returned ${result}`);
          }

          this.pointItemTransactionQuery.selectLoading()
            .pipe(takeUntil(this.transactionsLoading$))
            .subscribe(isLoading => {
              console.log('transactions loading: ' + isLoading);
              if (!isLoading) {
                this.pointItemTransactionQuery.selectAllAddTransactionsByUserId(user.userId)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((transactions: PointItemTransactionModel[]) => {
                    this.pointItemTransactions = transactions;
                    console.log('point item transactions');
                    console.log(this.pointItemTransactions);
                  });

                this.transactionsLoading$.next();
                this.transactionsLoading$.complete();
              }
            });
        });
    } else {
      console.log(`Already retrieving point item transactions`);
    }
  }

  populateCurrentUserPointTransactionData(currentUser: EntityCurrentUserModel) {
    console.log('populateCurrentUserPointTransactionData for ' + currentUser.userId);
    if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointItemsTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheUserPointItemTransactions(currentUser.userId)
        .pipe(take(1))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            result.pipe(take(1)).subscribe();
          } else {
            console.log(`Cache Current User Point Item Transactions returned ${result}`);
          }

          this.pointItemTransactionQuery.selectLoading()
            .pipe(takeUntil(this.transactionsLoading$))
            .subscribe(isLoading => {
              console.log('transactions loading: ' + isLoading);
              if (!isLoading) {
                this.pointItemTransactionQuery.selectAllAddTransactionsByUserId(currentUser.userId)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((transactions: PointItemTransactionModel[]) => {
                    this.pointItemTransactions = transactions;
                    console.log('point item transactions');
                    console.log(this.pointItemTransactions);
                  });

                this.transactionsLoading$.next();
                this.transactionsLoading$.complete();
              }
            });
        });
    } else {
      console.log(`Already retrieving point item transactions`);
    }
  }


  populateManagerPointTransactionData(managerUser: EntityUserModel) {
    if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointItemsTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheManagerPointItemTransactions(managerUser.userId)
        .pipe(take(1))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            result.pipe(take(1)).subscribe();
          } else {
            console.log(`Cache Manager Point Item Transactions returned ${result}`);
          }

          this.pointItemTransactionQuery.selectLoading()
            .pipe(takeUntil(this.transactionsLoading$))
            .subscribe(isLoading => {
              console.log('transactions loading: ' + isLoading);
              if (!isLoading) {
                this.pointItemTransactionQuery.selectAllAddTransactionsByManagerId(managerUser.userId)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((transactions: PointItemTransactionModel[]) => {
                    this.pointItemTransactions = transactions;
                    console.log('point item transactions');
                    console.log(this.pointItemTransactions);
                  });

                this.transactionsLoading$.next();
                this.transactionsLoading$.complete();
              }
            });
        });
    } else {
      console.log(`Already retrieving point item transactions`);
    }
  }


  populateCurrentManagerPointTransactionData(currentManager: EntityCurrentUserModel) {
    if (!this.pointItemsTransactionsRetrieving) { // This check prevents the API call from firing more than it has to
      this.pointItemsTransactionsRetrieving = true;
      this.pointItemTransactionService.cacheManagerPointItemTransactions(currentManager.userId)
        .pipe(take(1))
        .subscribe((result: Observable<any> | any) => {
          if (result !== false) {
            result.pipe(take(1)).subscribe();
          } else {
            console.log(`Cache Current Manager Point Item Transactions returned ${result}`);
          }

          this.pointItemTransactionQuery.selectLoading()
            .pipe(takeUntil(this.transactionsLoading$))
            .subscribe(isLoading => {
              console.log('transactions loading: ' + isLoading);
              if (!isLoading) {
                this.pointItemTransactionQuery.selectAllAddTransactionsByManagerId(currentManager.userId)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((transactions: PointItemTransactionModel[]) => {
                    this.pointItemTransactions = transactions;
                    console.log('point item transactions');
                    console.log(this.pointItemTransactions);
                  });

                this.transactionsLoading$.next();
                this.transactionsLoading$.complete();
              }
            });
        });
    } else {
      console.log(`Already retrieving point item transactions`);
    }
  }

  populateUserData() {
    this.userQuery.selectLoading()
      .pipe(takeUntil(this.userLoading$))
      .subscribe(userQueryLoading => {
        console.log(`User loading status is ${userQueryLoading}`);
        if (!userQueryLoading) {

          this.userQuery.selectUserByUsername(this.inputUser.username)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user: EntityUserModel) => {
              this.user = user;
              if (user.securityRole.Id === 2) {
                this.populateManagerPointTransactionData(user);

                this.isManager = true;
                this.isManagerDataRetrieved = true;
              } else {
                this.populateUserPointTransactionData(user);
                this.isUserDataRetrieved = true;
              }

              this.spinner.hide('point-item-spinner');
            });

          this.userLoading$.next();
          this.userLoading$.complete();
        } else {
          console.log('ERROR: User is still loading');
        }
      });
  }

  populateCurrentUserData() {
    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(currentUserQueryLoading => {
        console.log(`Current User loading status is ${currentUserQueryLoading}`);
        if (!currentUserQueryLoading) {

          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
              if (currentUser.securityRole.Id === 2) {
                this.populateCurrentManagerPointTransactionData(currentUser);

                this.isManager = true;
                this.isCurrentManagerDataRetrieved = true;
              } else {
                this.populateCurrentUserPointTransactionData(currentUser);

                this.isCurrentUserDataRetrieved = true;
              }

              this.spinner.hide('point-item-spinner');
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        } else {
          console.log('ERROR: User is still loading');
        }
      });
  }

  // groupBy function reference: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
  // I'm not sure why or how this works...
  groupBy (xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  onUserClick(userId: number) {
    const parentScope = this;
    const user = this.userQuery.getAll({
      filterBy: e => e.userId === userId
    });

    console.log(`closing modal and navigating to /user/profile/${user[0].username}`);
    this.routerDestination = ['/', 'user', 'profile', user[0].username];
    this.router.navigate(['/', 'user', 'profile', user[0].username]).then();
    this.navigationService.closePointItemModal();
    // this.dialogRef.close();

    $('#pointItemModal').on('hidden.bs.modal',
      function (e) {
        console.log('running on hidden function');
        console.log(e);
        parentScope.inputUser = null;
        parentScope.navigationService.pointItemComponentInputUser = null;
        parentScope.clearInputUser.emit(true);
        parentScope.navigationService.navigateToProfile(user[0].username);
        // parentScope.router.navigate(parentScope.routerDestination).then();
      });

    // $('#pointsModal').modal('hide');
    this.navigationService.closePointItemModal();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);

    if (changes) {
      console.log('clearing all variables');
      this.pointItems$ = null;
      this.pointItemTransactions$ = null;
      this.user$ = null;
      this.user = null;
      this.currentUser$ = null;
      this.currentUser = null;
      this.managerUser$ = null;
      this.managerUser = null;
      this.currentManager$ = null;
      this.currentManager = null;
      this.pointItemsTransactionsRetrieving = false;
      this.pointItemTransactions = null;
      this.isUserDataRetrieved = false;
      this.isCurrentUserDataRetrieved = false;
      this.isCurrentManagerDataRetrieved = false;
      this.isManagerDataRetrieved = false;
      this.isManager = false;
      this.showLimit = 6;

      console.log('on changes input user:');
      console.log(this.inputUser);


      if (this.inputUser) {
        console.log('on changes populating user data');
        this.populateUserData();
      } else {
        console.log('on changes populating current user data');
        this.populateCurrentUserData();
      }

      const parentScope = this;
      $('#pointItemModal').on('hidden.bs.modal',
        function (e) {
          console.log('running on hidden function');
          console.log(e);
          parentScope.inputUser = null;
          parentScope.navigationService.pointItemComponentInputUser = null;
          parentScope.clearInputUser.emit(true);
          parentScope.navigationService.pointItemModalActive = false;
        });
    }
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.inputUser = null;
    this.navigationService.pointItemComponentInputUser = null;
    this.clearInputUser.emit(true);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.userLoading$.next();
    this.userLoading$.complete();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.transactionsLoading$.next();
    this.transactionsLoading$.complete();
  }

}
