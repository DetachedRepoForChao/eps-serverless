import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EntityCurrentUserQuery } from 'src/app/entity-store/current-user/state/entity-current-user.query';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {

  isDefault = false;
  isConfirmPurchaseRequestSave = false;
  confirmPurchaseRequestData: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: any,
    private currentUserQuery: EntityCurrentUserQuery
  ) { }

  ngOnInit() {
    console.log('test');
    console.log(this.message);
    if (this.message.action && this.message.action === 'confirmPurchaseRequestSave') {
      console.log('test');
      this.isConfirmPurchaseRequestSave = true;
      this.confirmPurchaseRequestData = this.message.actionList.sort((a, b) => {
        if (a.item.userUsername < b.item.userUsername) { return -1; }
        if (a.item.userUsername > b.item.userUsername) { return 1; }
        return 0;
      });
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



}
