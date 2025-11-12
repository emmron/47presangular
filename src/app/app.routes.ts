import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/deals',
    pathMatch: 'full'
  },
  {
    path: 'deals',
    loadComponent: () => import('./pages/deals/deals.component').then(m => m.DealsComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./layout/pages/portfolio/portfolio.component').then(m => m.PortfolioComponent)
  },
  {
    path: 'games',
    redirectTo: '/portfolio',
    pathMatch: 'full'
  }
];
