import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly metrics = [
    {
      label: 'International matches this month',
      value: 12,
      change: '+3 vs. last tour block'
    },
    {
      label: 'Domestic fixtures this week',
      value: 27,
      change: '+5 after rain reschedules'
    },
    {
      label: 'Players in form watchlist',
      value: 18,
      change: '+6 earning media buzz'
    }
  ];
}
