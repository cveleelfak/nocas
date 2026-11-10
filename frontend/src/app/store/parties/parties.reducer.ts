import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Party } from '../../core/models/party.model';
import { PartiesActions } from './parties.actions';
import { AttendancesActions } from '../attendances/attendances.actions';

export interface PartiesState extends EntityState<Party> {
  selectedPartyId: number | null;
  loading: boolean;
  error: string | null;
}

const partiesAdapter = createEntityAdapter<Party>({
  sortComparer: (first, second) => first.startsAt.localeCompare(second.startsAt),
});

const initialState: PartiesState = partiesAdapter.getInitialState({
  selectedPartyId: null,
  loading: false,
  error: null,
});

const { selectAll } = partiesAdapter.getSelectors();

export const partiesFeature = createFeature({
  name: 'parties',
  reducer: createReducer(
    initialState,
    on(PartiesActions.loadParties, (state) => ({
      ...state,
      loading: true,
      error: null,
      selectedPartyId: null,
    })),
    on(PartiesActions.loadPartiesSuccess, (state, { parties }) =>
      partiesAdapter.setAll(parties, { ...state, loading: false }),
    ),
    on(PartiesActions.loadPartiesFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(PartiesActions.selectParty, (state, { partyId }) => ({
      ...state,
      selectedPartyId: partyId,
    })),
        on(AttendancesActions.attendSuccess, (state, { partyId }) =>
      partiesAdapter.mapOne(
        { id: partyId, map: (party) => ({ ...party, attendeeCount: (party.attendeeCount ?? 0) + 1 }) },
        state,
      ),
    ),
    on(AttendancesActions.cancelSuccess, (state, { partyId }) =>
      partiesAdapter.mapOne(
        {
          id: partyId,
          map: (party) => ({ ...party, attendeeCount: Math.max((party.attendeeCount ?? 0) - 1, 0) }),
        },
        state,
      ),
    ),
  ),
  extraSelectors: ({ selectPartiesState, selectEntities, selectSelectedPartyId }) => ({
    selectAllParties: createSelector(selectPartiesState, selectAll),
    selectSelectedParty: createSelector(selectEntities, selectSelectedPartyId, (entities, partyId) =>
      partyId === null ? null : (entities[partyId] ?? null),
    ),
  }),
});