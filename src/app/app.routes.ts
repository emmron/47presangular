import { Routes } from '@angular/router';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';
import { StoryDetailComponent } from './components/story/story-detail/story-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: NewsFeedComponent,
    title: 'Trump 47 Campaign Tracker'
  },
  {
    path: 'news/:id',
    component: StoryDetailComponent,
    title: 'Story detail • Trump 47 Campaign Tracker'
  }
];
