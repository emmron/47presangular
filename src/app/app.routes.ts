import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

export const routes: Routes = [
  {
    path: '',
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
