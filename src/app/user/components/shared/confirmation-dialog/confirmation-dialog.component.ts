import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EntityCurrentUserQuery } from 'src/app/entity-store/current-user/state/entity-current-user.query';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string,
    private currentUserQuery: EntityCurrentUserQuery
  ) { }

  ngOnInit() {
  }

  test() {
    const currentUser = this.currentUserQuery.getAll()[0];
    console.log(currentUser.points);
  }
}
