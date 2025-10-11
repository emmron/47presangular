import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { NewsStateService } from '../../../services/news-state.service';
import { NewsItem } from '../../../models/news.model';

interface TimelineEntry {
  day: string;
  items: NewsItem[];
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit {
  timeline$!: Observable<TimelineEntry[]>;

  constructor(private readonly stateService: NewsStateService) {}

  ngOnInit(): void {
    const state = this.stateService.currentState;
    if (!state.loading && state.items.length === 0) {
      this.stateService.fetchNews();
    }

    this.timeline$ = this.stateService.state$.pipe(
      map(state => this.buildTimeline(state.items))
    );
  }

  private buildTimeline(items: NewsItem[]): TimelineEntry[] {
    const grouped = new Map<string, NewsItem[]>();

    items.forEach(item => {
      const day = new Date(item.pubDate).toDateString();
      const dayItems = grouped.get(day) ?? [];
      dayItems.push(item);
      grouped.set(day, dayItems);
    });

    return Array.from(grouped.entries())
      .map(([day, entries]) => ({
        day,
        items: entries.sort(
          (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        )
      }))
      .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime())
      .slice(0, 7);
  }
}
