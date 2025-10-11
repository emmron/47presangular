import { Routes } from '@angular/router';

export const routes: Routes = [
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
    loadComponent: () =>
      import('./components/news-feed/news-feed.component').then(m => m.NewsFeedComponent)
  },
  {
    path: '**',
    redirectTo: 'timeline'
  }
];
