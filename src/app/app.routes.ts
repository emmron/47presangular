import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: NewsFeedComponent }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
