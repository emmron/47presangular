import { Routes } from '@angular/router';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

export const routes: Routes = [
  {
    path: '',
    component: NewsFeedComponent,
    title: 'Campaign Feed'
  },
  {
    path: 'my-feed',
    loadComponent: () => import('./features/profile/my-feed.component').then((m) => m.MyFeedComponent),
    title: 'My Feed'
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notification-center/notification-center.component')
        .then((m) => m.NotificationCenterComponent),
    title: 'Notifications'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
