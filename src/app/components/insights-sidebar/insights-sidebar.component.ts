import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';

type Insight = {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'steady';
  description: string;
};

@Component({
  selector: 'app-insights-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights-sidebar.component.html',
  styleUrls: ['./insights-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsightsSidebarComponent {
  readonly insights: Insight[] = [
    {
      label: 'Home summer form',
      value: '3-0',
      trend: 'up',
      description: 'Men’s ODI and T20 series wins to start the season'
    },
    {
      label: 'BBL run rate',
      value: '8.6',
      trend: 'up',
      description: 'League-wide scoring rate through week three'
    },
    {
      label: 'WBBL attendance',
      value: '41K',
      trend: 'steady',
      description: 'Fans through the gates across the most recent round'
    }
  ];

  readonly keyActions: string[] = [
    'Track Marsh Cup ladder movement each weekend',
    'Monitor selection whispers ahead of the Perth Test',
    'Spotlight junior nationals prospects pushing for contracts'
  ];
}
