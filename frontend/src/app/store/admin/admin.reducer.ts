import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Genre, Party, Venue } from '../../core/models/party.model';
import { AuthActions } from '../auth/auth.actions';
import { AdminActions } from './admin.actions';

export interface AdminState {
  pendingParties: EntityState<Party>;
  pendingVenues: EntityState<Venue>;
  genres: EntityState<Genre>;
  activeVenueCount: number;
  loading: boolean;
  error: string | null;
}

const partiesAdapter = createEntityAdapter<Party>();
const venuesAdapter = createEntityAdapter<Venue>();
const genresAdapter = createEntityAdapter<Genre>({
  sortComparer: (first, second) => first.name.localeCompare(second.name),
});

const initialState: AdminState = {
  pendingParties: partiesAdapter.getInitialState(),
  pendingVenues: venuesAdapter.getInitialState(),
  genres: genresAdapter.getInitialState(),
  activeVenueCount: 0,
  loading: false,
  error: null,
};

export const adminFeature = createFeature({
  name: 'admin',
  reducer: createReducer(
    initialState,
    on(AdminActions.loadDashboard, (state) => ({ ...state, loading: true, error: null })),
    on(AdminActions.loadDashboardSuccess, (state, { parties, venues, genres, activeVenueCount }) => ({
      ...state,
      loading: false,
      activeVenueCount,
      pendingParties: partiesAdapter.setAll(parties, state.pendingParties),
      pendingVenues: venuesAdapter.setAll(venues, state.pendingVenues),
      genres: genresAdapter.setAll(genres, state.genres),
    })),
    on(AdminActions.reviewPartySuccess, (state, { partyId }) => ({
      ...state,
      pendingParties: partiesAdapter.removeOne(partyId, state.pendingParties),
    })),
    on(AdminActions.reviewVenueSuccess, (state, { venueId, status }) => ({
      ...state,
      activeVenueCount: state.activeVenueCount + (status === 'APPROVED' ? 1 : 0),
      pendingVenues: venuesAdapter.removeOne(venueId, state.pendingVenues),
    })),
    on(AdminActions.createGenreSuccess, (state, { genre }) => ({
      ...state,
      genres: genresAdapter.addOne(genre, state.genres),
    })),
    on(AdminActions.deleteGenreSuccess, (state, { genreId }) => ({
      ...state,
      genres: genresAdapter.removeOne(genreId, state.genres),
    })),
    on(AdminActions.adminFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(AuthActions.logout, () => initialState),
  ),
  extraSelectors: ({ selectPendingParties, selectPendingVenues, selectGenres }) => ({
    selectPartyQueue: createSelector(selectPendingParties, partiesAdapter.getSelectors().selectAll),
    selectVenueQueue: createSelector(selectPendingVenues, venuesAdapter.getSelectors().selectAll),
    selectAllGenres: createSelector(selectGenres, genresAdapter.getSelectors().selectAll),
  }),
});