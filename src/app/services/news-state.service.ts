import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { NewsApiService } from './news-api.service';
import { NewsFilter, NewsItem, NewsQueryOptions, NewsResponse, NewsState } from '../models/news.model';
import { LoadingState } from '../models/loading-state.model';

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
  lastUpdated: null,
  total: 0,
  page: 1,
  pageSize: 20
};

@Injectable({
  providedIn: 'root'
})
export class NewsStateService implements OnDestroy {
  private state = new BehaviorSubject<NewsState>(initialState);
  private filters = new BehaviorSubject<NewsFilter>({});
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private destroy$ = new Subject<void>();

  constructor(private newsApiService: NewsApiService) {
    this.setupAutoRefresh();

    this.filters
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(() => this.fetchNews({ page: 1 }));

    this.fetchNews();
  }

  get state$(): Observable<NewsState> {
    return this.state.asObservable();
  }

  get filters$(): Observable<NewsFilter> {
    return this.filters.asObservable();
  }

  get currentState(): NewsState {
    return this.state.getValue();
  }

  get currentFilters(): NewsFilter {
    return this.filters.getValue();
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setItems(response: NewsResponse): void {
    this.updateState({
      items: response.items,
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      lastUpdated: new Date(),
      error: null,
      loading: false,
    });
  }

  updateFilters(filters: Partial<NewsFilter>): void {
    this.filters.next({
      ...this.currentFilters,
      ...filters,
    });
  }

  resetFilters(): void {
    this.filters.next({});
  }

  setPage(page: number): void {
    this.fetchNews({ page });
  }

  fetchNews(options: Partial<NewsQueryOptions> = {}): void {
    const query: NewsQueryOptions = {
      page: options.page ?? this.currentState.page,
      pageSize: options.pageSize ?? this.currentState.pageSize,
      sources: this.currentFilters.sources,
      topics: this.currentFilters.topics,
      search: this.currentFilters.searchTerm,
    };

    this.newsApiService.getNews(query).subscribe((loadingState: LoadingState<NewsResponse>) => {
      switch (loadingState.state) {
        case 'loading':
          this.updateState({ loading: true, error: null });
          break;
        case 'loaded':
          this.setItems(loadingState.data);
          break;
        case 'error':
          this.updateState({
            loading: false,
            error: loadingState.error.message,
          });
          break;
      }
    });
  }

  getFilteredItems(): NewsItem[] {
    const { items } = this.currentState;
    const filters = this.currentFilters;

    return items.filter(item => {
      if (filters.sources?.length && !filters.sources.includes(item.source.slug)) {
        return false;
      }
      if (filters.topics?.length && !item.topics.some(topic => filters.topics?.includes(topic))) {
        return false;
      }
      if (filters.dateFrom && item.publishedAt < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && item.publishedAt > filters.dateTo) {
        return false;
      }
      if (filters.searchTerm && !this.matchesSearchTerm(item, filters.searchTerm)) {
        return false;
      }
      return true;
    });
  }

  private matchesSearchTerm(item: NewsItem, term: string): boolean {
    const searchTerm = term.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchTerm) ||
      (!!item.summary && item.summary.toLowerCase().includes(searchTerm)) ||
      (!!item.content && item.content.toLowerCase().includes(searchTerm))
    );
  }

  private updateState(newState: Partial<NewsState>): void {
    this.state.next({
      ...this.currentState,
      ...newState,
    });
  }

  private setupAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.refreshSubscription = timer(this.REFRESH_INTERVAL, this.REFRESH_INTERVAL)
      .subscribe(() => {
        if (!this.currentState.loading) {
          this.fetchNews();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
