import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Attendance } from '../../core/models/party.model';
import { AuthActions } from '../auth/auth.actions';
import { AttendancesActions } from './attendances.actions';

export interface AttendancesState extends EntityState<Attendance> {
  loading: boolean;
  error: string | null;
}

const attendancesAdapter = createEntityAdapter<Attendance>();

const initialState: AttendancesState = attendancesAdapter.getInitialState({
  loading: false,
  error: null,
});

const { selectAll } = attendancesAdapter.getSelectors();

export const attendancesFeature = createFeature({
  name: 'attendances',
  reducer: createReducer(
    initialState,
    on(AttendancesActions.loadMine, (state) => ({ ...state, loading: true, error: null })),
    on(AttendancesActions.loadMineSuccess, (state, { attendances }) =>
      attendancesAdapter.setAll(attendances, { ...state, loading: false }),
    ),
    on(AttendancesActions.cancelSuccess, (state, { partyId }) =>
      attendancesAdapter.removeMany((attendance) => attendance.party.id === partyId, state),
    ),
    on(AttendancesActions.attendanceFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(AuthActions.logout, () => initialState),
  ),
  extraSelectors: ({ selectAttendancesState }) => {
    const selectMyAttendances = createSelector(selectAttendancesState, selectAll);
    return {
      selectMyAttendances,
      selectAttendingPartyIds: createSelector(selectMyAttendances, (attendances) =>
        attendances.map((attendance) => attendance.party.id),
      ),
    };
  },
});