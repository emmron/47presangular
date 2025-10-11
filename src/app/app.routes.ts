import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'news' },
  {
    path: 'news',
    loadComponent: () =>
      import('./components/news-feed/news-feed.component').then((m) => m.NewsFeedComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'issues',
    loadComponent: () => import('./pages/issues/issues.component').then((m) => m.IssuesComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events.component').then((m) => m.EventsComponent)
  },
  {
    path: 'get-involved',
    loadComponent: () =>
      import('./pages/get-involved/get-involved.component').then((m) => m.GetInvolvedComponent)
  },
  { path: '**', redirectTo: 'news' }
];
