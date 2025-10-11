import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DashboardSnapshot,
  FundraisingTotal,
  PollingTrend,
  SentimentBreakdown,
  ShareOfVoiceSlice,
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsDataService {
  private readonly polling: PollingTrend[] = [
    { date: '2024-05-01', candidate: 'Trump', support: 46 },
    { date: '2024-05-01', candidate: 'Harris', support: 43 },
    { date: '2024-06-01', candidate: 'Trump', support: 47 },
    { date: '2024-06-01', candidate: 'Harris', support: 44 },
    { date: '2024-07-01', candidate: 'Trump', support: 48 },
    { date: '2024-07-01', candidate: 'Harris', support: 42 },
    { date: '2024-08-01', candidate: 'Trump', support: 49 },
    { date: '2024-08-01', candidate: 'Harris', support: 41 },
  ];

  private readonly fundraising: FundraisingTotal[] = [
    { source: 'Grassroots', amount: 18.4, change: 12 },
    { source: 'Digital', amount: 9.2, change: 8 },
    { source: 'High-Dollar', amount: 24.1, change: 4 },
    { source: 'Events', amount: 11.7, change: 15 },
  ];

  private readonly sentiment: SentimentBreakdown[] = [
    { category: 'Positive', value: 58 },
    { category: 'Neutral', value: 24 },
    { category: 'Negative', value: 18 },
  ];

  private readonly shareOfVoice: ShareOfVoiceSlice[] = [
    { outlet: 'Cable News', mentions: 42 },
    { outlet: 'Online Media', mentions: 35 },
    { outlet: 'Radio', mentions: 11 },
    { outlet: 'Podcasts', mentions: 12 },
  ];

  getSnapshot(): Observable<DashboardSnapshot> {
    return of({
      polling: this.polling,
      fundraising: this.fundraising,
      sentiment: this.sentiment,
      shareOfVoice: this.shareOfVoice,
      summary: {
        votersContacted: 1250000,
        doorsKnocked: 845000,
        volunteerShifts: 23200,
        adSpend: 48.2,
      },
    });
  }
}
