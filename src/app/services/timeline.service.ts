import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TimelineEntry, TimelineCategory } from '../models/timeline.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly entries: TimelineEntry[] = [
    {
      id: 'tl-1',
      title: 'Campaign Launch Rally',
      description: 'Donald J. Trump launches the 47 campaign with a rally in Waco, TX.',
      date: '2024-03-25T23:00:00Z',
      category: 'milestone',
      link: 'https://47campaign.com/news/campaign-launch',
    },
    {
      id: 'tl-2',
      title: 'Jobs Plan Fact Sheet Released',
      description: 'Campaign releases comprehensive jobs plan fact sheet and supporting materials.',
      date: '2024-04-15T14:00:00Z',
      category: 'release',
      link: 'https://47campaign.com/news/jobs-plan',
    },
    {
      id: 'tl-3',
      title: 'National Poll Shows Momentum',
      description: 'Latest national poll shows Trump leading by 4 points nationally.',
      date: '2024-05-05T11:00:00Z',
      category: 'news',
      link: 'https://47campaign.com/news/polling-update',
    },
    {
      id: 'tl-4',
      title: 'Major Endorsement from Truckers Association',
      description: 'American Truckers Association endorses Trump citing infrastructure plan.',
      date: '2024-06-12T19:30:00Z',
      category: 'milestone',
      link: 'https://47campaign.com/news/truckers-endorsement',
    },
  ];

  getTimeline(category: TimelineCategory | 'all' = 'all'): Observable<TimelineEntry[]> {
    return of(
      this.entries
        .filter((entry) => category === 'all' || entry.category === category)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }
}
