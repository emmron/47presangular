import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { NewsStateService } from '../../services/news-state.service';
import { NewsItem, NewsFilter } from '../../models/news.model';
import { NewsItemComponent } from '../news-item/news-item.component';

interface SourceOption {
  name: string;
  slug: string;
}

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsItemComponent],
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss']
})
export class NewsFeedComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [];
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;
  searchTerm = '';
  selectedSource = '';

  private destroy$ = new Subject<void>();
  private searchDebounce$ = new Subject<string>();

  constructor(private stateService: NewsStateService) {
    this.searchDebounce$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(term => {
        this.updateFilters({ searchTerm: term || undefined });
      });
  }

  ngOnInit(): void {
    this.stateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.newsItems = state.items;
        this.loading = state.loading;
        this.error = state.error;
        this.lastUpdated = state.lastUpdated;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchNews(): void {
    this.stateService.fetchNews();
  }

  refreshNews(): void {
    this.fetchNews();
  }

  onSearchInput(term: string): void {
    this.searchTerm = term;
    this.searchDebounce$.next(term);
  }

  updateFilters(filters: Partial<NewsFilter>): void {
    this.stateService.updateFilters(filters);
  }

  onSourceChange(sourceSlug: string): void {
    this.selectedSource = sourceSlug;
    this.updateFilters({ sources: sourceSlug ? [sourceSlug] : undefined });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSource = '';
    this.stateService.resetFilters();
  }

  get availableSources(): SourceOption[] {
    const seen = new Map<string, string>();

    this.newsItems.forEach(item => {
      if (!seen.has(item.source.slug)) {
        seen.set(item.source.slug, item.source.name);
      }
    });

    return Array.from(seen.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get filteredItems(): NewsItem[] {
    return this.stateService.getFilteredItems();
  }

  get lastUpdatedText(): string {
    if (!this.lastUpdated) {
      return 'Never';
    }
    return this.lastUpdated.toLocaleString();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedSource);
  }
}
