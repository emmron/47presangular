import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CommunityComponent } from './components/community/community.component';
import { PremiumInsightsComponent } from './components/premium-insights/premium-insights.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'premium', component: PremiumInsightsComponent },
];
