import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { NewsState, NewsItem, NewsFilter } from '../models/news.model';
import { NewsApiService } from './news-api.service';

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class NewsStateService {
  private state = new BehaviorSubject<NewsState>(initialState);
  private filters = new BehaviorSubject<NewsFilter>({});
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(private newsApiService: NewsApiService) {
    this.setupAutoRefresh();
  }

  // State Observables
  get state$(): Observable<NewsState> {
    return this.state.asObservable();
  }

  get filters$(): Observable<NewsFilter> {
    return this.filters.asObservable();
  }

  // State Getters
  get currentState(): NewsState {
    return this.state.getValue();
  }

  get currentFilters(): NewsFilter {
    return this.filters.getValue();
  }

  // State Updates
  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setItems(items: NewsItem[]): void {
    this.updateState({
      items,
      lastUpdated: new Date(),
      error: null
    });
  }

  updateFilters(filters: Partial<NewsFilter>): void {
    this.filters.next({
      ...this.currentFilters,
      ...filters
    });
  }

  // Data Operations
  fetchNews(): void {
    this.newsApiService.getNews().subscribe({
      next: (loadingState) => {
        switch (loadingState.state) {
          case 'loading':
            this.updateState({ loading: true, error: null });
            break;
          case 'loaded':
            this.updateState({
              items: loadingState.data,
              loading: false,
              error: null,
              lastUpdated: new Date()
            });
            break;
          case 'error':
            this.updateState({
              loading: false,
              error: loadingState.error.message
            });
            break;
        }
      }
    });
  }

  getFilteredItems(): NewsItem[] {
    const { items } = this.currentState;
    const filters = this.currentFilters;

    return items.filter(item => {
      if (filters.source && item.source !== filters.source) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.dateFrom && new Date(item.pubDate) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(item.pubDate) > filters.dateTo) return false;
      if (filters.searchTerm && !this.matchesSearchTerm(item, filters.searchTerm)) return false;
      return true;
    });
  }

  private matchesSearchTerm(item: NewsItem, term: string): boolean {
    const searchTerm = term.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm)
    );
  }

  private updateState(newState: Partial<NewsState>): void {
    this.state.next({
      ...this.currentState,
      ...newState
    });
  }

  private setupAutoRefresh(): void {
    // Clear any existing subscription
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    // Set up new refresh timer
    this.refreshSubscription = timer(this.REFRESH_INTERVAL, this.REFRESH_INTERVAL)
      .subscribe(() => {
        if (!this.currentState.loading) {
          this.fetchNews();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
