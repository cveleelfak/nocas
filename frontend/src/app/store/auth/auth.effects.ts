import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { readErrorMessage } from '../../core/utils/http-error';
import { homeForRole } from '../../core/utils/role-home';
import { AuthActions } from './auth.actions';

export const login$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        authService.login(credentials).pipe(
          map((response) => AuthActions.authSuccess({ response })),
          catchError((error: HttpErrorResponse) =>
            of(AuthActions.authFailure({ error: readErrorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const register$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ data }) =>
        authService.register(data).pipe(
          map((response) => AuthActions.authSuccess({ response })),
          catchError((error: HttpErrorResponse) =>
            of(AuthActions.authFailure({ error: readErrorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const authSuccess$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.authSuccess),
      tap(({ response }) => {
        authService.saveSession(response);
        void router.navigateByUrl(homeForRole(response.user.role));
      }),
    ),
  { functional: true, dispatch: false },
);

export const logout$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        authService.clearSession();
        void router.navigateByUrl('/login');
      }),
    ),
  { functional: true, dispatch: false },
);