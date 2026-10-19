import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./features/my-attendances/my-attendances').then((m) => m.MyAttendances),
  },
  {
    path: 'owner',
    loadComponent: () => import('./features/owner-panel/owner-panel').then((m) => m.OwnerPanel),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin-panel/admin-panel').then((m) => m.AdminPanel),
  },
  { path: '**', redirectTo: '' },
];