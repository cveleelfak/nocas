import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  concatMap,
  exhaustMap,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  throwError,
  zip,
} from 'rxjs';
import { GeocodingService } from '../../core/services/geocoding.service';
import { PartyService } from '../../core/services/party.service';
import { VenueService } from '../../core/services/venue.service';
import { toErrorMessage } from '../../core/utils/http-error';
import { OwnerActions } from './owner.actions';

const toOwnerFailure = (error: unknown) =>
  of(OwnerActions.ownerFailure({ error: toErrorMessage(error) }));

export const loadDashboard$ = createEffect(
  (
    actions$ = inject(Actions),
    venueService = inject(VenueService),
    partyService = inject(PartyService),
  ) =>
    actions$.pipe(
      ofType(OwnerActions.loadDashboard),
      switchMap(() =>
        zip(venueService.getMine(), partyService.getMine()).pipe(
          map(([venues, parties]) => OwnerActions.loadDashboardSuccess({ venues, parties })),
          catchError(toOwnerFailure),
        ),
      ),
    ),
  { functional: true },
);

export const createVenue$ = createEffect(
  (
    actions$ = inject(Actions),
    geocodingService = inject(GeocodingService),
    venueService = inject(VenueService),
  ) =>
    actions$.pipe(
      ofType(OwnerActions.createVenue),
      exhaustMap(({ request }) =>
        from(geocodingService.findCoordinates(request.address)).pipe(
          switchMap((coordinates) => {
            if (!coordinates) {
              return throwError(
                () => new Error('Adresa nije pronadjena na mapi, upisi ulicu, broj i grad'),
              );
            }
            return venueService.create({ ...request, ...coordinates });
          }),
          map((venue) => OwnerActions.createVenueSuccess({ venue })),
          catchError(toOwnerFailure),
        ),
      ),
    ),
  { functional: true },
);

export const saveParty$ = createEffect(
  (actions$ = inject(Actions), partyService = inject(PartyService)) =>
    actions$.pipe(
      ofType(OwnerActions.saveParty),
      concatMap(({ partyId, request }) => {
        const save$ =
          partyId === null ? partyService.create(request) : partyService.update(partyId, request);
        return save$.pipe(
          map((party) => OwnerActions.savePartySuccess({ party })),
          catchError(toOwnerFailure),
        );
      }),
    ),
  { functional: true },
);

export const deleteParty$ = createEffect(
  (actions$ = inject(Actions), partyService = inject(PartyService)) =>
    actions$.pipe(
      ofType(OwnerActions.deleteParty),
      mergeMap(({ partyId }) =>
        partyService.remove(partyId).pipe(
          map(() => OwnerActions.deletePartySuccess({ partyId })),
          catchError(toOwnerFailure),
        ),
      ),
    ),
  { functional: true },
);