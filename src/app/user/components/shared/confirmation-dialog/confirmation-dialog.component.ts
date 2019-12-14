import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EntityCurrentUserQuery } from 'src/app/entity-store/current-user/state/entity-current-user.query';
import {StoreItemModel} from '../../../../entity-store/store-item/state/store-item.model';
import {takeUntil} from 'rxjs/operators';
import {EntityCurrentUserModel} from '../../../../entity-store/current-user/state/entity-current-user.model';
import {Subject} from 'rxjs';
import {PointItemModel} from '../../../../entity-store/point-item/state/point-item.model';
import {EntityUserModel} from '../../../../entity-store/user/state/entity-user.model';
import {EntityUserQuery} from '../../../../entity-store/user/state/entity-user.query';
import {Department} from '../../../../shared/department.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {

  isDefault = false;
  isUpdatePurchaseRequestStatusSave = false;
  isConfirmStoreItemPurchase = false;
  isAwardPoints = false;
  private currentUserLoading$ = new Subject();
  private usersLoading$ = new Subject();
  private unsubscribe$ = new Subject();


  currentUser: EntityCurrentUserModel;
  users: EntityUserModel[];
  confirmPurchaseRequestData: any[] = [];
  selectedStoreItem: StoreItemModel;
  selectedPointItem: PointItemModel;
  selectedEmployees: EntityUserModel[];
  selectedDepartment: Department;
  selectedAll: boolean;
  awardCommentForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: any,
    private currentUserQuery: EntityCurrentUserQuery,
    private userQuery: EntityUserQuery,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    console.log('test');
    console.log(this.message);
    if (this.message.action) {
      switch (this.message.action) {
        case 'updatePurchaseRequestStatusSave':
          console.log('updatePurchaseRequestStatusSave');
          this.isUpdatePurchaseRequestStatusSave = true;
          this.confirmPurchaseRequestData = this.message.actionList.sort((a, b) => {
            if (a.item.userUsername < b.item.userUsername) { return -1; }
            if (a.item.userUsername > b.item.userUsername) { return 1; }
            return 0;
          });
          break;
        case 'confirmStoreItemPurchase':
          console.log('confirmStoreItemPurchase');
          this.isConfirmStoreItemPurchase = true;
          this.selectedStoreItem = this.message.selectedStoreItem;
          break;
        case 'confirmAwardPoints':
          console.log('confirmAwardPoints', this.message);
          this.isAwardPoints = true;
          this.selectedPointItem = this.message.selectedPointItem;
          this.selectedEmployees = this.message.selectedEmployees;
          this.selectedDepartment = this.message.selectedDepartment;
          this.selectedAll = this.message.selectedAll;
          break;

      }
    } else {
      this.isDefault = true;
    }

    this.currentUserQuery.selectLoading()
      .pipe(takeUntil(this.currentUserLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.currentUserQuery.selectCurrentUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((currentUser: EntityCurrentUserModel) => {
              this.currentUser = currentUser;
            });

          this.currentUserLoading$.next();
          this.currentUserLoading$.complete();
        }
      });

    this.userQuery.selectLoading()
      .pipe(takeUntil(this.usersLoading$))
      .subscribe(isLoading => {
        if (!isLoading) {
          this.userQuery.selectAll({
            filterBy: e => e.securityRole.Id === 1
          })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((users: EntityUserModel[]) => {
              this.users = users;
            });

          this.usersLoading$.next();
          this.usersLoading$.complete();
        }
      });

    if (this.isAwardPoints) {
      this.loadAwardCommentForm();
    }
  }

  loadAwardCommentForm() {
    this.awardCommentForm = this.formBuilder.group({
      awardComment: [null, Validators.maxLength(255)],
    });
  }

  onCloseConfirm() {
    this.dialogRef.close('Confirm');
  }

  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  onAwardPointsCloseConfirm(awardComment: string) {
    this.dialogRef.close({
      action: 'Confirm',
      comment: awardComment,
    });
  }

  ngOnDestroy(): void {
    console.log('Destroying');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.currentUserLoading$.next();
    this.currentUserLoading$.complete();
    this.usersLoading$.next();
    this.usersLoading$.complete();
    // this.isUpdatePurchaseRequestStatusSave = false;
    // this.isConfirmStoreItemPurchase = false;
    // this.confirmPurchaseRequestData = [];
    // this.selectedStoreItem = null;
  }

}
