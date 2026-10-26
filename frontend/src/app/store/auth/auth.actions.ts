import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ credentials: LoginRequest }>(),
    Register: props<{ data: RegisterRequest }>(),
    'Auth Success': props<{ response: AuthResponse }>(),
    'Auth Failure': props<{ error: string }>(),
    'Session Restored': props<{ response: AuthResponse }>(),
    Logout: emptyProps(),
  },
});