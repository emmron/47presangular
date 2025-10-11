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
      label: 'WTC standings',
      value: '66 pts',
      trend: 'up',
      description: 'Australia extend their lead after the SCG Test win'
    },
    {
      label: 'BBL net run rate',
      value: '+0.923',
      trend: 'steady',
      description: 'Scorchers hold top spot with consistent margin victories'
    },
    {
      label: 'WBBL ladder climb',
      value: '+2',
      trend: 'up',
      description: 'Sydney Sixers jump two places following back-to-back wins'
    }
  ];

  readonly keyActions: string[] = [
    'Monitor Marsh Cup squad announcements due Friday',
    'Track injury updates for the New Zealand tour',
    'Compile broadcast changes for regional WBBL viewers'
  ];
}
