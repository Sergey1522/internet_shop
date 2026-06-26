import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authForwardGuard: CanActivateFn = (route, state) => {
  const authServise = inject(AuthService);
  const location = inject(Location);
  if (authServise.getIsLoggedIn()) {
    location.back();
    return false;
  }
  return true;
};
