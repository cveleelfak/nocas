import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs';
import { authFeature } from '../../store/auth/auth.reducer';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(Store);
  return store.select(authFeature.selectToken).pipe(
    take(1),
    switchMap((token) => {
      if (!token) {
        return next(request);
      }
      return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }),
  );
};