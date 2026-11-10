import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, mergeMap, of, switchMap } from 'rxjs';
import { AttendanceService } from '../../core/services/attendance.service';
import { readErrorMessage } from '../../core/utils/http-error';
import { AuthActions } from '../auth/auth.actions';
import { AttendancesActions } from './attendances.actions';

const toFailure = (error: HttpErrorResponse) =>
  of(AttendancesActions.attendanceFailure({ error: readErrorMessage(error) }));

export const loadMine$ = createEffect(
  (actions$ = inject(Actions), attendanceService = inject(AttendanceService)) =>
    actions$.pipe(
      ofType(AttendancesActions.loadMine),
      switchMap(() =>
        attendanceService.getMine().pipe(
          map((attendances) => AttendancesActions.loadMineSuccess({ attendances })),
          catchError(toFailure),
        ),
      ),
    ),
  { functional: true },
);

export const attend$ = createEffect(
  (actions$ = inject(Actions), attendanceService = inject(AttendanceService)) =>
    actions$.pipe(
      ofType(AttendancesActions.attend),
      mergeMap(({ partyId }) =>
        attendanceService.attend(partyId).pipe(
          map(() => AttendancesActions.attendSuccess({ partyId })),
          catchError(toFailure),
        ),
      ),
    ),
  { functional: true },
);

export const cancel$ = createEffect(
  (actions$ = inject(Actions), attendanceService = inject(AttendanceService)) =>
    actions$.pipe(
      ofType(AttendancesActions.cancel),
      mergeMap(({ partyId }) =>
        attendanceService.cancel(partyId).pipe(
          map(() => AttendancesActions.cancelSuccess({ partyId })),
          catchError(toFailure),
        ),
      ),
    ),
  { functional: true },
);

export const reloadAfterAttend$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AttendancesActions.attendSuccess),
      map(() => AttendancesActions.loadMine()),
    ),
  { functional: true },
);

export const loadMineForUser$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AuthActions.authSuccess, AuthActions.sessionRestored),
      filter(({ response }) => response.user.role === 'USER'),
      map(() => AttendancesActions.loadMine()),
    ),
  { functional: true },
);