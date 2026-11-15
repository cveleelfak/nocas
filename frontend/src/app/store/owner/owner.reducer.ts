import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Party, Venue } from '../../core/models/party.model';
import { AuthActions } from '../auth/auth.actions';
import { OwnerActions } from './owner.actions';

export interface OwnerState {
  venues: EntityState<Venue>;
  parties: EntityState<Party>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const venuesAdapter = createEntityAdapter<Venue>({
  sortComparer: (first, second) => first.name.localeCompare(second.name),
});

const partiesAdapter = createEntityAdapter<Party>({
  sortComparer: (first, second) => second.startsAt.localeCompare(first.startsAt),
});

const initialState: OwnerState = {
  venues: venuesAdapter.getInitialState(),
  parties: partiesAdapter.getInitialState(),
  loading: false,
  saving: false,
  error: null,
};

const venueSelectors = venuesAdapter.getSelectors();
const partySelectors = partiesAdapter.getSelectors();

export const ownerFeature = createFeature({
  name: 'owner',
  reducer: createReducer(
    initialState,
    on(OwnerActions.loadDashboard, (state) => ({ ...state, loading: true, error: null })),
    on(OwnerActions.loadDashboardSuccess, (state, { venues, parties }) => ({
      ...state,
      loading: false,
      venues: venuesAdapter.setAll(venues, state.venues),
      parties: partiesAdapter.setAll(parties, state.parties),
    })),
    on(OwnerActions.createVenue, OwnerActions.saveParty, OwnerActions.deleteParty, (state) => ({
      ...state,
      saving: true,
      error: null,
    })),
    on(OwnerActions.createVenueSuccess, (state, { venue }) => ({
      ...state,
      saving: false,
      venues: venuesAdapter.addOne(venue, state.venues),
    })),
    on(OwnerActions.savePartySuccess, (state, { party }) => ({
      ...state,
      saving: false,
      parties: partiesAdapter.upsertOne(party, state.parties),
    })),
    on(OwnerActions.deletePartySuccess, (state, { partyId }) => ({
      ...state,
      saving: false,
      parties: partiesAdapter.removeOne(partyId, state.parties),
    })),
    on(OwnerActions.ownerFailure, (state, { error }) => ({
      ...state,
      loading: false,
      saving: false,
      error,
    })),
    on(AuthActions.logout, () => initialState),
  ),
  extraSelectors: ({ selectVenues, selectParties }) => {
    const selectMyVenues = createSelector(selectVenues, venueSelectors.selectAll);
    return {
      selectMyVenues,
      selectApprovedVenues: createSelector(selectMyVenues, (venues) =>
        venues.filter((venue) => venue.status === 'APPROVED'),
      ),
      selectMyParties: createSelector(selectParties, partySelectors.selectAll),
    };
  },
});