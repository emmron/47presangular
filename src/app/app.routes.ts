import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LandingComponent } from './layout/pages/landing/landing.component';
import { LatestComponent } from './layout/pages/latest/latest.component';
import { TimelineComponent } from './layout/pages/timeline/timeline.component';
import { IssuesComponent } from './layout/pages/issues/issues.component';
import { MediaComponent } from './layout/pages/media/media.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'latest', component: LatestComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'issues', component: IssuesComponent },
      { path: 'media', component: MediaComponent }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
