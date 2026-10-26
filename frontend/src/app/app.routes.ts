import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/party-map/party-map').then((m) => m.PartyMap),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
    {
    path: 'my-attendances',
    canActivate: [roleGuard('USER')],
    loadComponent: () =>
      import('./features/my-attendances/my-attendances').then((m) => m.MyAttendances),
  },
  {
    path: 'owner',
    canActivate: [roleGuard('OWNER')],
    loadComponent: () => import('./features/owner-panel/owner-panel').then((m) => m.OwnerPanel),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('./features/admin-panel/admin-panel').then((m) => m.AdminPanel),
  },
  { path: '**', redirectTo: '' },
];