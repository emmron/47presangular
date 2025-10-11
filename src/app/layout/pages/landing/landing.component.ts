import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroMetricsComponent } from '../../components/hero-metrics/hero-metrics.component';
import { NewsFeedComponent } from '../../../components/news-feed/news-feed.component';
import { NewsStateService } from '../../../services/news-state.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, HeroMetricsComponent, NewsFeedComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  constructor(private readonly stateService: NewsStateService) {}

  ngOnInit(): void {
    const state = this.stateService.currentState;
    if (!state.loading && state.items.length === 0) {
      this.stateService.fetchNews();
    }
  }
}
