import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  NewsState,
  NewsItem,
  NewsFilter,
  SavedFilterPreset,
  DigestState,
  DigestSchedule,
  DigestSummary
} from '../models/news.model';
import { NewsApiService } from './news-api.service';
import { AuthService } from '../auth/auth.service';

interface SavedFilterPresetDto {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface FilterPresetResponse {
  presets: SavedFilterPresetDto[];
}

interface DigestResponse {
  schedule: DigestSchedule | null;
  history: DigestSummary[];
}
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
  private savedPresets = new BehaviorSubject<SavedFilterPreset[]>([]);
  private digestState = new BehaviorSubject<DigestState>({ schedule: null, history: [] });

  private refreshSubscription?: Subscription;
  private userSubscription?: Subscription;

  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly backendUrl = 'http://localhost:4000/api';
  private destroy$ = new Subject<void>();

  constructor(
    private newsApiService: NewsApiService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.setupAutoRefresh();

    this.userSubscription = this.authService.user$.subscribe((user) => {
      if (user) {
        this.loadFilterPresets();
        this.loadDigestSchedule();
      } else {
        this.savedPresets.next([]);
        this.digestState.next({ schedule: null, history: [] });
      }
    });
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

  get savedPresets$(): Observable<SavedFilterPreset[]> {
    return this.savedPresets.asObservable();
  }

  get digestSchedule$(): Observable<DigestState> {
    return this.digestState.asObservable();
  }

  // State Getters
  get currentState(): NewsState {
    return this.state.getValue();
  }

  get currentFilters(): NewsFilter {
    return this.filters.getValue();
  }

  get currentPresets(): SavedFilterPreset[] {
    return this.savedPresets.getValue();
  }

  get currentDigest(): DigestState {
    return this.digestState.getValue();
  }

  // State Updates
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

  applyPreset(preset: SavedFilterPreset): void {
    this.filters.next({ ...preset.filters });
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
  // Data Operations
  fetchNews(forceRefresh = false): void {
    this.newsApiService.getNews(forceRefresh).subscribe({
      next: (loadingState) => {
        switch (loadingState.state) {
          case 'loading':
            this.updateState({ loading: true, error: null });
            break;
          case 'loaded':
            this.updateState({
              items: this.enrichItems(loadingState.data),
              loading: false,
              error: null,
              lastUpdated: new Date()
            });
            break;
          case 'error':
            this.handleBackendError(loadingState.error);
            break;
        }
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

  saveCurrentFilters(name: string): Observable<SavedFilterPreset> {
    return this.withUser((userId) =>
      this.http.post<{ preset: SavedFilterPresetDto }>(
        `${this.backendUrl}/users/${userId}/filters`,
        {
          name,
          filters: this.serializeFilters(this.currentFilters)
        },
        this.getAuthOptions()
      ).pipe(
        map((response) => this.normalizePreset(response.preset)),
        tap((preset) => {
          this.savedPresets.next([...this.currentPresets, preset]);
        })
      )
    );
  }

  deleteFilterPreset(presetId: string): Observable<void> {
    return this.withUser((userId) =>
      this.http.delete<void>(
        `${this.backendUrl}/users/${userId}/filters/${presetId}`,
        this.getAuthOptions()
      ).pipe(
        tap(() => {
          this.savedPresets.next(
            this.currentPresets.filter((preset) => preset.id !== presetId)
          );
        })
      )
    );
  }

  updateDigestSchedule(schedule: Pick<DigestSchedule, 'frequency' | 'timeOfDay' | 'timezone'>): Observable<DigestState> {
    return this.withUser((userId) =>
      this.http.post<{ schedule: DigestSchedule }>(
        `${this.backendUrl}/users/${userId}/digest`,
        schedule,
        this.getAuthOptions()
      ).pipe(
        tap((response) => {
          const current = this.currentDigest;
          this.digestState.next({
            schedule: response.schedule,
            history: current.history
          });
        }),
        map(() => this.digestState.getValue())
      )
    );
  }

  clearDigestSchedule(): Observable<void> {
    return this.withUser((userId) =>
      this.http.delete<void>(
        `${this.backendUrl}/users/${userId}/digest`,
        this.getAuthOptions()
      ).pipe(
        tap(() => {
          const current = this.currentDigest;
          this.digestState.next({
            schedule: null,
            history: current.history
          });
        })
      )
    );
  }

  loadDigestPreview(): Observable<DigestSummary> {
    return this.withUser((userId) =>
      this.http.post<{ generatedAt: string; summary: string }>(
        `${this.backendUrl}/users/${userId}/digest/test`,
        {},
        this.getAuthOptions()
      ).pipe(
        map((response) => ({
          id: `${Date.now()}`,
          generatedAt: response.generatedAt,
          summary: response.summary,
          test: true
        })),
        tap((preview) => {
          const current = this.currentDigest;
          this.digestState.next({
            schedule: current.schedule,
            history: [preview, ...current.history]
          });
        })
      )
    );
  }

  private loadFilterPresets(): void {
    this.withUser((userId) =>
      this.http.get<FilterPresetResponse>(
        `${this.backendUrl}/users/${userId}/filters`,
        this.getAuthOptions()
      ).pipe(
        map((response) => response.presets.map((preset) => this.normalizePreset(preset)))
      )
    ).subscribe({
      next: (presets) => this.savedPresets.next(presets),
      error: (error) => console.error('Failed to load filter presets', error)
    });
  }

  private loadDigestSchedule(): void {
    this.withUser((userId) =>
      this.http.get<DigestResponse>(
        `${this.backendUrl}/users/${userId}/digest`,
        this.getAuthOptions()
      ).pipe(
        map((response) => ({
          schedule: response.schedule,
          history: response.history || []
        }))
      )
    ).subscribe({
      next: (state) => this.digestState.next(state),
      error: (error) => console.error('Failed to load digest schedule', error)
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

  private handleBackendError(error: Error): void {
    const friendlyMessage = error.message || 'The news feed is currently unavailable.';
    this.updateState({
      loading: false,
      error: friendlyMessage
    });
  }

  private enrichItems(items: NewsItem[]): NewsItem[] {
    return items.map(item => ({
      ...item,
      content: item.content ?? '',
      category: item.category ?? 'News'
    }));
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

  private withUser<T>(operation: (userId: string) => Observable<T>): Observable<T> {
    const user = this.authService.currentUser;
    if (!user) {
      return throwError(() => new Error('User is not authenticated'));
    }
    return operation(user.id);
  }

  private serializeFilters(filters: NewsFilter): Record<string, any> {
    const serialized: Record<string, any> = { ...filters };
    if (filters.dateFrom instanceof Date) {
      serialized['dateFrom'] = filters.dateFrom.toISOString();
    }
    if (filters.dateTo instanceof Date) {
      serialized['dateTo'] = filters.dateTo.toISOString();
    }
    return serialized;
  }

  private deserializeFilters(filters: Record<string, any>): NewsFilter {
    const result: NewsFilter = { ...filters };
    if (filters?.['dateFrom']) {
      result.dateFrom = new Date(filters['dateFrom']);
    }
    if (filters?.['dateTo']) {
      result.dateTo = new Date(filters['dateTo']);
    }
    return result;
  }

  private normalizePreset(preset: SavedFilterPresetDto): SavedFilterPreset {
    return {
      id: preset.id,
      name: preset.name,
      createdAt: preset.createdAt,
      updatedAt: preset.updatedAt,
      filters: this.deserializeFilters(preset.filters || {})
    };
  }

  private getAuthOptions() {
    return {
      headers: this.authService.getAuthHeaders()
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
