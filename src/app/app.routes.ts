import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LandingComponent } from './layout/pages/landing/landing.component';
import { LatestComponent } from './layout/pages/latest/latest.component';
import { TimelineComponent } from './layout/pages/timeline/timeline.component';
import { IssuesComponent } from './layout/pages/issues/issues.component';
import { MediaComponent } from './layout/pages/media/media.component';
import { ShellComponent } from './components/shell/shell.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

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
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'latest', component: LatestComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'issues', component: IssuesComponent },
      { path: 'media', component: MediaComponent }
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'timeline'
      },
      {
        path: 'timeline',
        loadComponent: () =>
          import('./routes/timeline/timeline.component').then(m => m.TimelineComponent)
      },
      {
        path: 'topics/:slug',
        loadComponent: () =>
          import('./routes/topic-page/topic-page.component').then(m => m.TopicPageComponent)
      },
      {
        path: 'news',
        component: NewsFeedComponent
      },
      {
        path: 'news/:id',
        loadComponent: () =>
          import('./components/story/story-detail/story-detail.component').then(m => m.StoryDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
