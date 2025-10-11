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
      label: 'International form',
      value: '4-1',
      trend: 'up',
      description: 'Australia’s win-loss record across the last five internationals'
    },
    {
      label: 'BBL ladder leaders',
      value: 'Sixers',
      trend: 'steady',
      description: 'Sydney Sixers hold top spot with a 1.22 net run rate'
    },
    {
      label: 'Shield centuries',
      value: '3 this week',
      trend: 'up',
      description: 'Number of Aussie batters raising the bat in the latest round'
    }
  ];

  readonly keyActions: string[] = [
    'Monitor selection battles ahead of the winter tours',
    'Track BBL draft rumours and overseas signings',
    'Highlight standout performances from Premier Cricket'
  ];
}
