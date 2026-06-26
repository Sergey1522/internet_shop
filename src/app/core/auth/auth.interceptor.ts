import { LoginResponseType } from './../../../types/login.response.type';
import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { DefaultResponseType } from '../../../types/default.response.type';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  authServices = inject(AuthService);
  router = inject(Router);
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokens = this.authServices.getTokens();
    console.log(tokens);
    if (tokens && tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-access-token', tokens.accessToken),
      });
      return next.handle(authReq).pipe(
        catchError((error) => {
          if (
            error.status === 401 &&
            !authReq.url.includes('/login') &&
            !authReq.url.includes('/refresh')
          ) {
          }
          return throwError(() => error);
        }),
      );
    }
    return next.handle(req);
  }
  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this.authServices.refresh().pipe(
      switchMap((result: DefaultResponseType | LoginResponseType) => {
        let error = '';
        if ((result as DefaultResponseType).error !== undefined) {
          error = (result as DefaultResponseType).message;
        }
        const refreshResult = result as LoginResponseType;
        if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
          error = 'Ошибка авторизации';
        }
        if (error) {
          throwError(() => new Error(error));
        }
        this.authServices.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
        const authReq = req.clone({
          headers: req.headers.set('x-access-token', refreshResult.accessToken),
        });
        return next.handle(authReq);
      }),
      catchError((error) => {
        this.authServices.removeTokens();
        this.router.navigate(['/']);
        return throwError(() => error);
      }),
    );
  }
}
