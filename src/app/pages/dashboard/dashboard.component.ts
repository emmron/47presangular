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
      label: 'World Test Championship points',
      value: 66,
      change: '+12 after Sydney victory'
    },
    {
      label: 'BBL wins this fortnight',
      value: 9,
      change: 'Scorchers & Heat lead the ladder'
    },
    {
      label: 'WBBL run rate trend',
      value: '+0.37',
      change: 'Sixers surge over past 3 matches'
    }
  ];
}
