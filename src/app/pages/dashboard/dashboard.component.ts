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
      value: 9,
      change: 'Aussies 4 wins in last 5'
    },
    {
      label: 'BBL leading run-scorer',
      value: 'Matt Short – 512',
      change: '+54 from last outing'
    },
    {
      label: 'Shield table points gap',
      value: 'NSW +6',
      change: 'Tasmania close behind on 38'
    }
  ];
}
