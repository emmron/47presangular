import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { NewsStateService } from '../../../services/news-state.service';
import { NewsItem } from '../../../models/news.model';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaComponent implements OnInit {
  media$!: Observable<NewsItem[]>;

  constructor(private readonly stateService: NewsStateService) {}

  ngOnInit(): void {
    const state = this.stateService.currentState;
    if (!state.loading && state.items.length === 0) {
      this.stateService.fetchNews();
    }

    this.media$ = this.stateService.state$.pipe(
      map(state =>
        state.items.filter(item => !!item.imageUrl).slice(0, 9)
      )
    );
  }
}
