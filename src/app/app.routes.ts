import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'timeline' },
      {
        path: 'timeline',
        loadComponent: () =>
          import('./routes/timeline/timeline.component').then((m) => m.TimelineComponent)
      },
      {
        path: 'topics/:slug',
        loadComponent: () =>
          import('./routes/topic-page/topic-page.component').then((m) => m.TopicPageComponent)
      },
      { path: 'news', component: NewsFeedComponent },
      {
        path: 'news/:id',
        loadComponent: () =>
          import('./components/story/story-detail/story-detail.component').then((m) => m.StoryDetailComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.component').then((m) => m.EventsComponent)
      },
      {
        path: 'get-involved',
        loadComponent: () =>
          import('./pages/get-involved/get-involved.component').then((m) => m.GetInvolvedComponent)
      },
      {
        path: 'issues',
        loadComponent: () =>
          import('./pages/issues/issues.component').then((m) => m.IssuesComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
