import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import Auth from '@aws-amplify/auth';
import {NotifierService} from 'angular-notifier';
import {Router} from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  @Input() username: string;
  @Input() codeSent = false;
  // codeSent = false;
  // username: string;

  getCodeModel: FormGroup = new FormGroup({
    username: new FormControl(''),
  });

  resetPasswordModel: FormGroup = new FormGroup({
    username: new FormControl(''),
    code: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private notifierService: NotifierService,
              private router: Router) {
    console.log(this.router.getCurrentNavigation().extras);
    if (this.router.getCurrentNavigation().extras.state) {
      this.username = this.router.getCurrentNavigation().extras.state.username;
      this.codeSent = this.router.getCurrentNavigation().extras.state.codeSent;
      this.resetPasswordModel.value.username = this.username;
    }
  }

  ngOnInit() {
  }

  getCode(form: NgForm) {
    console.log(form);
    if (!form.valid) {
      console.log('Invalid submission');
    } else {
      Auth.forgotPassword(form.value.codeGetUsername)
        .then((data: any) => {
          console.log(data);
          this.username = form.value.codeGetUsername;
          this.resetPasswordModel.value.username = this.username;
          this.codeSent = true;
        })
        .catch(err => {
          console.log('An error occurred');
          console.log(err);
          this.notifierService.notify('error', err.message);
        });
    }
  }

  resetPassword(form: NgForm) {
    console.log(form);
    if (!form.valid) {
      console.log('Invalid submission');
    } else {
      Auth.forgotPasswordSubmit(form.value.codeSentUsername, form.value.codeSentCode, form.value.codeSentPassword)
        .then(() => {
          this.notifierService.notify('success', 'Password reset successful!');
        })
        .catch(err => {
          console.log('An error occurred');
          console.log(err);

        });
    }
  }

  sendAgain() {
    Auth.forgotPassword(this.username)
      .then(() => this.notifierService.notify('success', 'A code has been sent to you'))
      .catch(() => this.notifierService.notify('error', 'An error occurred'));
  }

  alreadyHaveCodeClick() {
    this.codeSent = true;
  }



  notify(type: string) {
    this.notifierService.notify(type, 'Test');
  }

}
