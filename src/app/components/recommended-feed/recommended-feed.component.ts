import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { RecommendationService } from '../../services/recommendation.service';
import { AnalyticsService } from '../../services/analytics.service';
import { UserIdentityService } from '../../services/user-identity.service';
import { NewsItem } from '../../models/news.model';
import { RecommendationFeed } from '../../models/recommendation.model';
import { NewsItemComponent } from '../news-item/news-item.component';

@Component({
  selector: 'app-recommended-feed',
  standalone: true,
  imports: [CommonModule, NewsItemComponent],
  templateUrl: './recommended-feed.component.html',
  styleUrls: ['./recommended-feed.component.scss']
})
export class RecommendedFeedComponent implements OnInit, OnDestroy {
  protected feed = signal<RecommendationFeed | null>(null);
  protected loading = signal<boolean>(true);
  protected errorMessage = signal<string | null>(null);

  protected readonly items = computed<NewsItem[]>(() => this.feed()?.items ?? []);
  protected readonly strategy = computed(() => this.feed()?.strategy ?? 'fallback');
  protected readonly cohort = computed(() => this.feed()?.cohort);

  private destroy$ = new Subject<void>();

  constructor(
    private recommendationService: RecommendationService,
    private analyticsService: AnalyticsService,
    private userIdentityService: UserIdentityService
  ) {}

  ngOnInit(): void {
    this.recommendationService.recommendations$().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: feed => {
        this.feed.set(feed);
        this.loading.set(false);
        this.errorMessage.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to load recommendations right now.');
      }
    });

    this.analyticsService.events$.pipe(
      takeUntil(this.destroy$),
      debounceTime(1500)
    ).subscribe(() => this.refresh());

    this.userIdentityService.userId$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      skip(1)
    ).subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.loading.set(true);
    this.recommendationService.refresh();
  }
}
