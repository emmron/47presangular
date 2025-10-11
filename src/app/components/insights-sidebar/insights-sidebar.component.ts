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
      label: 'Digital reach',
      value: '2.1M',
      trend: 'up',
      description: 'Impressions across official channels in the last 48 hours'
    },
    {
      label: 'Grassroots events',
      value: '38',
      trend: 'steady',
      description: 'Scheduled rallies and town halls this week'
    },
    {
      label: 'Volunteer signups',
      value: '+14%',
      trend: 'up',
      description: 'Week-over-week increase in new volunteers'
    }
  ];

  readonly keyActions: string[] = [
    'Track upcoming debate preparation milestones',
    'Highlight localized policy rollouts for supporters',
    'Coordinate regional press availability with rapid response team'
  ];
}
