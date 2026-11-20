import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';
import { GenreService } from '../../core/services/genre.service';
import { PartyService } from '../../core/services/party.service';
import { VenueService } from '../../core/services/venue.service';
import { toErrorMessage } from '../../core/utils/http-error';
import { AdminActions } from './admin.actions';

const toAdminFailure = (error: unknown) =>
  of(AdminActions.adminFailure({ error: toErrorMessage(error) }));

export const loadAdminDashboard$ = createEffect(
  (
    actions$ = inject(Actions),
    partyService = inject(PartyService),
    venueService = inject(VenueService),
    genreService = inject(GenreService),
  ) =>
    actions$.pipe(
      ofType(AdminActions.loadDashboard),
      switchMap(() =>
        forkJoin({
          parties: partyService.getPending(),
          venues: venueService.getPending(),
          genres: genreService.getAll(),
          activeVenues: venueService.getApproved(),
        }).pipe(
          map(({ parties, venues, genres, activeVenues }) =>
            AdminActions.loadDashboardSuccess({
              parties,
              venues,
              genres,
              activeVenueCount: activeVenues.length,
            }),
          ),
          catchError(toAdminFailure),
        ),
      ),
    ),
  { functional: true },
);

export const reviewParty$ = createEffect(
  (actions$ = inject(Actions), partyService = inject(PartyService)) =>
    actions$.pipe(
      ofType(AdminActions.reviewParty),
      mergeMap(({ partyId, decision }) =>
        partyService.review(partyId, decision).pipe(
          map(() => AdminActions.reviewPartySuccess({ partyId })),
          catchError(toAdminFailure),
        ),
      ),
    ),
  { functional: true },
);

export const reviewVenue$ = createEffect(
  (actions$ = inject(Actions), venueService = inject(VenueService)) =>
    actions$.pipe(
      ofType(AdminActions.reviewVenue),
      mergeMap(({ venueId, status }) =>
        venueService.review(venueId, status).pipe(
          map(() => AdminActions.reviewVenueSuccess({ venueId, status })),
          catchError(toAdminFailure),
        ),
      ),
    ),
  { functional: true },
);

export const createGenre$ = createEffect(
  (actions$ = inject(Actions), genreService = inject(GenreService)) =>
    actions$.pipe(
      ofType(AdminActions.createGenre),
      concatMap(({ name }) =>
        genreService.create(name).pipe(
          map((genre) => AdminActions.createGenreSuccess({ genre })),
          catchError(toAdminFailure),
        ),
      ),
    ),
  { functional: true },
);

export const deleteGenre$ = createEffect(
  (actions$ = inject(Actions), genreService = inject(GenreService)) =>
    actions$.pipe(
      ofType(AdminActions.deleteGenre),
      mergeMap(({ genreId }) =>
        genreService.remove(genreId).pipe(
          map(() => AdminActions.deleteGenreSuccess({ genreId })),
          catchError(toAdminFailure),
        ),
      ),
    ),
  { functional: true },
);