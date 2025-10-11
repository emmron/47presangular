import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { DashboardSnapshot } from '../../models/analytics.model';
import { AnalyticsDataService } from '../../services/analytics-data.service';

interface DashboardViewModel {
  snapshot: DashboardSnapshot;
  pollingSeries: Array<{ name: string; series: Array<{ name: string; value: number }> }>;
  fundraisingSeries: Array<{ name: string; value: number }>;
  sentimentSeries: Array<{ name: string; value: number }>;
  shareOfVoiceSeries: Array<{ name: string; value: number }>;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  vm$!: Observable<DashboardViewModel>;
  readonly pollingScheme: Color = {
    name: 'polling',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#c62828', '#2e7d32', '#1565c0'],
  };
  readonly fundraisingScheme: Color = {
    name: 'fundraising',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#fbc02d', '#ef6c00', '#6a1b9a', '#00838f'],
  };
  readonly sentimentScheme: Color = {
    name: 'sentiment',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2e7d32', '#546e7a', '#c62828'],
  };
  readonly shareOfVoiceScheme: Color = {
    name: 'share-of-voice',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1e88e5', '#3949ab', '#00acc1', '#8e24aa'],
  };

  constructor(private readonly analytics: AnalyticsDataService) {}

  ngOnInit(): void {
    this.vm$ = this.analytics.getSnapshot().pipe(
      map((snapshot) => ({
        snapshot,
        pollingSeries: this.mapPolling(snapshot),
        fundraisingSeries: snapshot.fundraising.map((item) => ({
          name: item.source,
          value: item.amount,
        })),
        sentimentSeries: snapshot.sentiment.map((item) => ({
          name: item.category,
          value: item.value,
        })),
        shareOfVoiceSeries: snapshot.shareOfVoice.map((item) => ({
          name: item.outlet,
          value: item.mentions,
        })),
      }))
    );
  }

  trackByOutlet(_: number, item: DashboardSnapshot['shareOfVoice'][number]): string {
    return item.outlet;
  }

  private mapPolling(snapshot: DashboardSnapshot): Array<{
    name: string;
    series: Array<{ name: string; value: number }>;
  }> {
    const grouped = new Map<string, Array<{ name: string; value: number }>>();
    snapshot.polling.forEach((trend) => {
      const list = grouped.get(trend.candidate) ?? [];
      list.push({ name: trend.date, value: trend.support });
      grouped.set(trend.candidate, list);
    });

    return Array.from(grouped.entries()).map(([candidate, series]) => ({
      name: candidate,
      series: series.sort((a, b) => (a.name < b.name ? -1 : 1)),
    }));
  }
}
