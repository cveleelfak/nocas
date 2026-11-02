import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PartyService } from '../../core/services/party.service';
import { readErrorMessage } from '../../core/utils/http-error';
import { PartiesActions } from './parties.actions';

export const loadParties$ = createEffect(
  (actions$ = inject(Actions), partyService = inject(PartyService)) =>
    actions$.pipe(
      ofType(PartiesActions.loadParties),
      switchMap(({ date }) =>
        partyService.getForNight(date).pipe(
          map((parties) => PartiesActions.loadPartiesSuccess({ parties })),
          catchError((error: HttpErrorResponse) =>
            of(PartiesActions.loadPartiesFailure({ error: readErrorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);