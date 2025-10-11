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
      label: 'Battleground events this week',
      value: 18,
      change: '+4 vs. last week'
    },
    {
      label: 'Grassroots captains onboarded',
      value: 312,
      change: '+28 in the last 24 hours'
    },
    {
      label: 'Digital impressions YTD',
      value: '47M',
      change: '+8% month over month'
    }
  ];
}
