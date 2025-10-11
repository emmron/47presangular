import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { NewsStateService } from '../../../services/news-state.service';
import { NewsItem } from '../../../models/news.model';

interface HeroMetricsViewModel {
  loading: boolean;
  totalArticles: number;
  lastUpdated: Date | null;
  topSources: { name: string; count: number }[];
  trendingIssues: string[];
  latestHeadline: string | null;
  latestSource: string | null;
}

@Component({
  selector: 'app-hero-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-metrics.component.html',
  styleUrls: ['./hero-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroMetricsComponent implements OnInit {
  metrics$!: Observable<HeroMetricsViewModel>;

  constructor(private readonly stateService: NewsStateService) {}

  ngOnInit(): void {
    this.metrics$ = this.stateService.state$.pipe(
      map(state => this.buildMetrics(state.items, state.lastUpdated, state.loading))
    );

    const current = this.stateService.currentState;
    if (!current.loading && current.items.length === 0) {
      this.stateService.fetchNews();
    }
  }

  private buildMetrics(
    items: NewsItem[],
    lastUpdated: Date | null,
    loading: boolean
  ): HeroMetricsViewModel {
    const sorted = [...items].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const latest = sorted[0];
    const topSources = this.getTopSources(items, 3);
    const trendingIssues = this.getTrendingIssues(items, 4);

    return {
      loading,
      totalArticles: items.length,
      lastUpdated,
      topSources,
      trendingIssues,
      latestHeadline: latest?.title ?? null,
      latestSource: latest?.source ?? null
    };
  }

  private getTopSources(items: NewsItem[], limit: number): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!item.source) continue;
      counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  private getTrendingIssues(items: NewsItem[], limit: number): string[] {
    const categories = new Map<string, number>();

    items.forEach(item => {
      if (!item.category) return;
      categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
    });

    if (categories.size === 0) {
      const keywords = new Map<string, number>();
      items.forEach(item => {
        const words = item.title.split(/\s+/);
        words
          .map(word => word.replace(/[^a-z0-9]/gi, '').toLowerCase())
          .filter(word => word.length > 4)
          .forEach(word => {
            keywords.set(word, (keywords.get(word) ?? 0) + 1);
          });
      });

      return Array.from(keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word]) => word);
    }

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category]) => category);
  }
}
