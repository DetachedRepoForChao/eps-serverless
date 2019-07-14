import { Component, OnInit } from '@angular/core';
import {FormGroup, Validators, FormControl, NgForm} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import Auth from '@aws-amplify/auth';
import {NotificationService} from '../../shared/notifications/notification.service';
import {NotifierService} from 'angular-notifier';


@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss']
})
export class ConfirmCodeComponent implements OnInit {

  email = environment.confirm.email;
  username = environment.confirm.username;

  confirmForm: FormGroup = new FormGroup({
    email: new FormControl({value: this.email, disabled: true}),
    code: new FormControl('', [ Validators.required, Validators.min(3) ])
  });

  get codeInput() { return this.confirmForm.get('code'); }

  constructor( private _router: Router,
               private _notification: NotifierService ) { }

  ngOnInit() {
    if (!this.email) {
      this._router.navigateByUrl('/signup');
    } else {
      Auth.resendSignUp(this.email);
    }
  }

  sendAgain() {
    Auth.resendSignUp(this.email)
      .then(() => this._notification.notify('Success', 'A code has been emailed to you'))
      .catch(() => this._notification.notify('Error', 'An error occurred'));
  }

  confirmCode(form: NgForm) {
    console.log(form.value);
    Auth.confirmSignUp(this.username, form.value.code)
      .then((data: any) => {
        console.log(data);
        if (data === 'SUCCESS' &&
          environment.confirm.email &&
          environment.confirm.password) {
          Auth.signIn(this.email, environment.confirm.password)
            .then(() => {
              this._router.navigate(['']);
            }).catch((error: any) => {
            this._router.navigateByUrl('/signin');
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this._notification.show(error.message);
      });
  }

}
