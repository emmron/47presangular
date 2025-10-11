import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
    data: {
      title: 'Dashboard',
    },
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/events.component').then((m) => m.EventsComponent),
    data: {
      title: 'Events',
    },
  },
  {
    path: 'positions',
    loadChildren: () =>
      import('./features/issues/issues.module').then((m) => m.IssuesModule),
    data: {
      title: 'Policy Positions',
    },
  },
  {
    path: 'timeline',
    loadComponent: () =>
      import('./features/timeline/timeline.component').then(
        (m) => m.TimelineComponent
      ),
    data: {
      title: 'Timeline',
    },
  },
  {
    path: 'widgets',
    loadChildren: () =>
      import('./features/widgets/widgets.module').then((m) => m.WidgetsModule),
    data: {
      title: 'Widget SDK',
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
