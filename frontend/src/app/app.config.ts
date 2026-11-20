import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { AuthActions } from './store/auth/auth.actions';
import { authFeature } from './store/auth/auth.reducer';
import * as authEffects from './store/auth/auth.effects';
import { partiesFeature } from './store/parties/parties.reducer';
import * as partiesEffects from './store/parties/parties.effects';
import { attendancesFeature } from './store/attendances/attendances.reducer';
import * as attendancesEffects from './store/attendances/attendances.effects';
import { ownerFeature } from './store/owner/owner.reducer';
import * as ownerEffects from './store/owner/owner.effects';
import { adminFeature } from './store/admin/admin.reducer';
import * as adminEffects from './store/admin/admin.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(),
    provideState(authFeature),
    provideState(partiesFeature),
    provideState(attendancesFeature),
    provideState(ownerFeature),
    provideState(adminFeature),
    provideEffects(authEffects, partiesEffects, attendancesEffects, ownerEffects, adminEffects),
    provideStoreDevtools({ maxAge: 25 }),
    provideAppInitializer(() => {
      const session = inject(AuthService).restoreSession();
      if (session) {
        inject(Store).dispatch(AuthActions.sessionRestored({ response: session }));
      }
    }),
  ]
};
