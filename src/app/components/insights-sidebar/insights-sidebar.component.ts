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
      label: 'International form guide',
      value: '4-1',
      trend: 'up',
      description: 'Combined record from the last five Australian internationals'
    },
    {
      label: 'Domestic ladder movers',
      value: '3 clubs',
      trend: 'steady',
      description: 'Teams jumping two or more spots across Shield and WNCL tables'
    },
    {
      label: 'Standout performers',
      value: '6 players',
      trend: 'up',
      description: 'Reached 50+ runs or 3+ wickets in the past 48 hours'
    }
  ];

  readonly keyActions: string[] = [
    'Monitor upcoming squad announcements and injury reports',
    'Highlight Big Bash contract windows and trade whispers',
    'Spotlight community cricket participation drives across the states'
  ];
}
