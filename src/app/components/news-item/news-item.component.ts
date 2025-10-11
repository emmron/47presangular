import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { NewsItem } from '../../models/news.model';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-item.component.html',
  styleUrl: './news-item.component.scss'
})
export class NewsItemComponent implements OnDestroy {
  @Input() item!: NewsItem;
  @Input() showSave = false;
  @Input() analyticsContext?: string;

  isSaved = false;

  constructor(private analytics: AnalyticsService) {}

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onReadMoreClick(): void {
    this.analytics.trackClick(this.item, this.analyticsMetadata());
  }

  toggleSave(): void {
    this.isSaved = !this.isSaved;
    this.analytics.trackSave(this.item, this.isSaved, this.analyticsMetadata());
  }

  onMouseEnter(): void {
    this.analytics.startDwell(this.item);
  }

  onMouseLeave(): void {
    this.analytics.endDwell(this.item, this.analyticsMetadata());
  }

  ngOnDestroy(): void {
    if (this.item) {
      this.analytics.endDwell(this.item, this.analyticsMetadata());
    }
  }

  private analyticsMetadata(): Record<string, unknown> {
    return {
      context: this.analyticsContext,
      strategy: this.item.metrics?.strategy,
      cohort: this.item.metrics?.cohortLabel,
      recommendationScore: this.item.metrics?.recommendationScore
    };
  }
}
