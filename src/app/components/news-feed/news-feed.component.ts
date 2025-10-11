import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { NewsStateService } from '../../services/news-state.service';
import { NewsItemComponent } from '../news-item/news-item.component';
import { NewsItem, NewsFilter } from '../../models/news.model';
import { SavedNewsFilter } from '../../models/user.model';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { AuthService } from '../../services/auth.service';

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
  savedFilters: SavedNewsFilter[] = [];
  activeSavedFilterId: string | null = null;
  onlyFollowedTopics = false;
  newFilterName = '';
  followTopics: string[] = [];
  isLoggedIn = false;
  preferencesError: string | null = null;

  private destroy$ = new Subject<void>();
  private searchDebounce$ = new Subject<string>();
  private savedArticleIds = new Set<string>();

  constructor(
    private stateService: NewsStateService,
    private preferences: UserPreferencesService,
    private auth: AuthService
  ) {
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

    this.stateService.filters$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.searchTerm = filters.searchTerm ?? '';
      this.selectedSource = filters.source ?? '';
      this.onlyFollowedTopics = !!filters.onlyFollowedTopics;
      this.activeSavedFilterId = filters.savedFilterId ?? null;
    });

    this.preferences.savedFilters$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.savedFilters = filters;
    });

    this.preferences.savedArticles$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(articles => {
      this.savedArticleIds = new Set(articles.map(article => article.articleId));
    });

    this.preferences.profile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(profile => {
      this.followTopics = profile?.followTopics ?? [];
    });

    this.auth.isLoggedIn$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (!isLoggedIn) {
        this.preferencesError = null;
      }
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
    this.onlyFollowedTopics = false;
    this.activeSavedFilterId = null;
    this.stateService.resetFilters();
  }

  async saveCurrentFilter(): Promise<void> {
    if (!this.isLoggedIn) {
      this.preferencesError = 'Sign in to save your filters and searches.';
      return;
    }

    const name = this.newFilterName.trim();
    if (!name) {
      this.preferencesError = 'Please provide a name for your saved search.';
      return;
    }

    try {
      await this.stateService.saveCurrentFilters(name);
      this.newFilterName = '';
      this.preferencesError = null;
    } catch (error) {
      console.error('Failed to save filter', error);
      this.preferencesError = error instanceof Error ? error.message : 'Failed to save filter. Please try again later.';
    }
  }

  async onSavedFilterSelect(filterId: string): Promise<void> {
    if (!filterId) {
      this.clearFilters();
      return;
    }

    try {
      await this.stateService.applySavedFilter(filterId);
      this.preferencesError = null;
    } catch (error) {
      console.error('Failed to apply saved filter', error);
      this.preferencesError = error instanceof Error ? error.message : 'Unable to apply saved filter.';
    }
  }

  async deleteSavedFilter(filterId: string): Promise<void> {
    try {
      await this.stateService.removeSavedFilter(filterId);
      if (this.activeSavedFilterId === filterId) {
        this.activeSavedFilterId = null;
      }
    } catch (error) {
      console.error('Failed to delete saved filter', error);
      this.preferencesError = error instanceof Error ? error.message : 'Unable to delete saved filter.';
    }
  }

  async saveArticle(item: NewsItem): Promise<void> {
    if (!this.isLoggedIn) {
      this.preferencesError = 'Sign in to save articles to your feed.';
      return;
    }

    try {
      await this.preferences.saveArticle(item);
      this.preferencesError = null;
    } catch (error) {
      console.error('Failed to save article', error);
      this.preferencesError = error instanceof Error ? error.message : 'Unable to save article right now.';
    }
  }

  isArticleSaved(articleId: string): boolean {
    return this.savedArticleIds.has(articleId);
  }

  onToggleFollowedTopics(event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    this.onlyFollowedTopics = checked;
    this.updateFilters({ onlyFollowedTopics: checked });
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
    return !!(this.searchTerm || this.selectedSource || this.onlyFollowedTopics || this.activeSavedFilterId);
  }

  get canFilterByFollowedTopics(): boolean {
    return this.followTopics.length > 0;
  }

  trackByNewsId(_index: number, item: NewsItem): string {
    return item.id;
  }
}
