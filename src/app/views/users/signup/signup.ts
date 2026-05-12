import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NgStyle } from '@angular/common';
import { MatchPasswordDirective } from '../../../shared/directives/match-password.directive';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { LoginResponseType } from '../../../../types/login.response.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, NgStyle, MatchPasswordDirective, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private _snackbar = inject(MatSnackBar);
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)],
      ],
      passwordRepeat: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)],
      ],
      accept: [false, [Validators.requiredTrue]],
    });
  }

  signup(): void {
    if (
      this.signupForm.valid &&
      this.signupForm.value.email &&
      this.signupForm.value.password &&
      this.signupForm.value.passwordRepeat &&
      this.signupForm.value.accept
    ) {
      this.authService
        .signup(
          this.signupForm.value.email,
          this.signupForm.value.password,
          this.signupForm.value.passwordRepeat,
        )
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType) => {
            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
            }
            const loginResponse = data as LoginResponseType;
            if (
              !loginResponse.accessToken ||
              !loginResponse.refreshToken ||
              !loginResponse.userId
            ) {
              error = 'Ошибка регистрации';
            }
            if (error) {
              this._snackbar.open(error);
              throw new Error(error);
            }
            this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
            this.authService.userId = loginResponse.userId;

            this._snackbar.open('Вы успешно зарегистрировались');
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackbar.open(errorResponse.error.message);
            } else {
              this._snackbar.open('Ошибка регистрации');
            }
          },
        });
    }
  }
}
