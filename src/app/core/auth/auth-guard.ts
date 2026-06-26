import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
  const authServise = inject(AuthService);
  const _snackbar = inject(MatSnackBar);
  const isLoggedIn = authServise.getIsLoggedIn();
  if (!isLoggedIn) {
    _snackbar.open('Для доступа необходимо авторизоваться', '', {
      duration: 3000,
    });
  }
  return isLoggedIn;
};
