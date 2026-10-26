import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.login, AuthActions.register, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(AuthActions.authSuccess, AuthActions.sessionRestored, (state, { response }) => ({
      ...state,
      user: response.user,
      token: response.accessToken,
      loading: false,
      error: null,
    })),
    on(AuthActions.authFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(AuthActions.logout, () => initialState),
  ),
  extraSelectors: ({ selectUser }) => ({
    selectRole: createSelector(selectUser, (user) => user?.role ?? null),
  }),
});