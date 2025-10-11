import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { NewsStateService } from '../../../services/news-state.service';
import { NewsItem } from '../../../models/news.model';

interface IssueCluster {
  name: string;
  stories: number;
  sources: number;
}

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssuesComponent implements OnInit {
  issues$!: Observable<IssueCluster[]>;

  constructor(private readonly stateService: NewsStateService) {}

  ngOnInit(): void {
    const state = this.stateService.currentState;
    if (!state.loading && state.items.length === 0) {
      this.stateService.fetchNews();
    }

    this.issues$ = this.stateService.state$.pipe(
      map(state => this.buildIssueClusters(state.items))
    );
  }

  private buildIssueClusters(items: NewsItem[]): IssueCluster[] {
    const clusters = new Map<string, { stories: number; sources: Set<string> }>();

    items.forEach(item => {
      const label = item.category ?? 'general';
      if (!clusters.has(label)) {
        clusters.set(label, { stories: 0, sources: new Set<string>() });
      }
      const bucket = clusters.get(label)!;
      bucket.stories += 1;
      if (item.source) {
        bucket.sources.add(item.source);
      }
    });

    return Array.from(clusters.entries())
      .map(([name, data]) => ({
        name,
        stories: data.stories,
        sources: data.sources.size
      }))
      .sort((a, b) => b.stories - a.stories)
      .slice(0, 8);
  }
}
