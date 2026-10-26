import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { authFeature } from '../../store/auth/auth.reducer';
import { Role } from '../models/user.model';

export function roleGuard(...allowedRoles: Role[]): CanActivateFn {
  return () => {
    const store = inject(Store);
    const router = inject(Router);
    return store.select(authFeature.selectUser).pipe(
      take(1),
      map((user) => {
        if (!user) {
          return router.createUrlTree(['/login']);
        }
        return allowedRoles.includes(user.role) ? true : router.createUrlTree(['/']);
      }),
    );
  };
}