import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { NewsStateService } from '../../services/news-state.service';
import { NewsItemComponent } from '../news-item/news-item.component';
import { NewsItem, NewsFilter } from '../../models/news.model';

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
    // Set up debounced search
    this.searchDebounce$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(term => {
      this.updateFilters({ searchTerm: term });
    });
  }

  ngOnInit(): void {
    // Subscribe to state changes
    this.stateService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.newsItems = state.items;
      this.loading = state.loading;
      this.error = state.error;
      this.lastUpdated = state.lastUpdated;
    });

    // Initial data fetch
    this.fetchNews();
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

  onSourceChange(source: string): void {
    this.selectedSource = source;
    this.updateFilters({ source });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSource = '';
    this.updateFilters({});
  }

  get availableSources(): string[] {
    return [...new Set(this.newsItems.map(item => item.source))].sort();
  }

  get filteredItems(): NewsItem[] {
    return this.stateService.getFilteredItems();
  }

  get lastUpdatedText(): string {
    if (!this.lastUpdated) return 'Never';
    return this.lastUpdated.toLocaleString();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedSource);
  }
}
