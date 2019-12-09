import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EntityCurrentUserQuery } from 'src/app/entity-store/current-user/state/entity-current-user.query';
import {StoreItemModel} from '../../../../entity-store/store-item/state/store-item.model';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {

  isDefault = false;
  isUpdatePurchaseRequestStatusSave = false;
  isConfirmStoreItemPurchase = false;

  confirmPurchaseRequestData: any[] = [];
  selectedStoreItem: StoreItemModel;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: any,
    private currentUserQuery: EntityCurrentUserQuery
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

      }
    } else {
      this.isDefault = true;
    }
  }

  onCloseConfirm() {
    this.dialogRef.close('Confirm');
  }

  onCloseCancel() {
    this.dialogRef.close('Cancel');
  }

  ngOnDestroy(): void {
    console.log('Destroying');
    // this.isUpdatePurchaseRequestStatusSave = false;
    // this.isConfirmStoreItemPurchase = false;
    // this.confirmPurchaseRequestData = [];
    // this.selectedStoreItem = null;
  }

}
