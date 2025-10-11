import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { NewsStateService } from '../../../services/news-state.service';
import { NewsItem } from '../../../models/news.model';

@Component({
  selector: 'app-latest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latest.component.html',
  styleUrls: ['./latest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestComponent implements OnInit {
  items$!: Observable<NewsItem[]>;
  loading$ = this.stateService.state$.pipe(map(state => state.loading));

  constructor(private readonly stateService: NewsStateService) {}

  ngOnInit(): void {
    const state = this.stateService.currentState;
    if (!state.loading && state.items.length === 0) {
      this.stateService.fetchNews();
    }

    this.items$ = this.stateService.state$.pipe(
      map(state =>
        [...state.items]
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, 12)
      )
    );
  }
}
