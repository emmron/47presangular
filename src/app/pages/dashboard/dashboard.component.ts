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
      label: 'International wins this summer',
      value: '6',
      change: '+2 vs. same time last year'
    },
    {
      label: 'BBL strike-rate leaders',
      value: '3',
      change: 'All averaging 170+ SR'
    },
    {
      label: 'Premier Cricket live streams',
      value: '12',
      change: '+4 new broadcasts this week'
    }
  ];
}
