import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { NewsState, NewsItem, NewsFilter } from '../models/news.model';
import { SavedNewsFilter } from '../models/user.model';
import { NewsApiService } from './news-api.service';
import { UserPreferencesService } from './user-preferences.service';

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
  private savedFilters = new BehaviorSubject<SavedNewsFilter[]>([]);
  private refreshSubscription?: Subscription;
  private activeFilterId: string | null = null;
  private hydratingFilters = false;
  private subscriptions: Subscription[] = [];
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private newsApiService: NewsApiService,
    private preferences: UserPreferencesService
  ) {
    this.setupAutoRefresh();
    this.registerPreferenceSubscriptions();
  }

  // State Observables
  get state$(): Observable<NewsState> {
    return this.state.asObservable();
  }

  get filters$(): Observable<NewsFilter> {
    return this.filters.asObservable();
  }

  get savedFilters$(): Observable<SavedNewsFilter[]> {
    return this.savedFilters.asObservable();
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
    const current = this.currentFilters;
    const next: NewsFilter = {
      ...current,
      ...filters
    };

    if (filters.savedFilterId !== undefined) {
      this.activeFilterId = filters.savedFilterId ?? null;
    } else if (!this.hydratingFilters && this.activeFilterId) {
      const activeSnapshot = this.savedFilters.getValue().find(filter => filter.id === this.activeFilterId);
      if (activeSnapshot && !this.areFiltersEqual(next, { ...activeSnapshot.filters, savedFilterId: activeSnapshot.id })) {
        this.activeFilterId = null;
        next.savedFilterId = null;
      } else {
        next.savedFilterId = this.activeFilterId;
      }
    } else if (this.activeFilterId) {
      next.savedFilterId = this.activeFilterId;
    }

    this.filters.next(next);

    if (!this.hydratingFilters) {
      this.preferences.queuePersistActiveFilters(this.withoutMetadata(next), this.activeFilterId);
    }
  }

  resetFilters(): void {
    this.activeFilterId = null;
    const cleared: NewsFilter = {};
    this.filters.next(cleared);
    this.preferences.queuePersistActiveFilters(cleared, null);
    void this.preferences.setActiveFilter(null);
  }

  async saveCurrentFilters(name: string): Promise<SavedNewsFilter | null> {
    const sanitized = this.withoutMetadata(this.currentFilters);
    const saved = await this.preferences.createSavedFilter(name, sanitized);
    if (!saved) {
      return null;
    }

    this.activeFilterId = saved.id;
    this.hydratingFilters = true;
    this.filters.next({
      ...saved.filters,
      savedFilterId: saved.id
    });
    this.hydratingFilters = false;

    await this.preferences.setActiveFilter(saved.id);
    this.preferences.queuePersistActiveFilters(this.withoutMetadata(saved.filters), saved.id);
    return saved;
  }

  async applySavedFilter(filterId: string): Promise<void> {
    const snapshot = this.savedFilters.getValue().find(filter => filter.id === filterId);
    if (!snapshot) {
      return;
    }

    this.activeFilterId = filterId;
    this.hydratingFilters = true;
    this.filters.next({
      ...snapshot.filters,
      savedFilterId: filterId
    });
    this.hydratingFilters = false;

    await this.preferences.setActiveFilter(filterId);
    this.preferences.queuePersistActiveFilters(this.withoutMetadata(snapshot.filters), filterId);
  }

  async removeSavedFilter(filterId: string): Promise<void> {
    await this.preferences.deleteSavedFilter(filterId);

    if (this.activeFilterId === filterId) {
      this.resetFilters();
    }
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
    const profile = this.preferences.currentProfile;

    return items.filter(item => {
      if (filters.source && item.source !== filters.source) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.dateFrom && new Date(item.pubDate) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(item.pubDate) > filters.dateTo) return false;
      if (filters.searchTerm && !this.matchesSearchTerm(item, filters.searchTerm)) return false;
      if (filters.topics?.length && !filters.topics.some(topic => this.matchesSearchTerm(item, topic))) return false;
      if (filters.onlyFollowedTopics && profile?.followTopics?.length) {
        const matchesFollowTopic = profile.followTopics.some(topic => this.matchesSearchTerm(item, topic));
        if (!matchesFollowTopic) {
          return false;
        }
      }
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

  private registerPreferenceSubscriptions(): void {
    const profileSubscription = this.preferences.profile$.subscribe(profile => {
      if (!profile) {
        this.hydratingFilters = true;
        this.activeFilterId = null;
        this.filters.next({});
        this.hydratingFilters = false;
        return;
      }

      this.activeFilterId = profile.activeFilterId ?? null;

      let filtersToApply: NewsFilter | null = null;
      if (profile.activeFilters) {
        filtersToApply = {
          ...profile.activeFilters,
          savedFilterId: this.activeFilterId
        };
      } else if (profile.activeFilterId) {
        const snapshot = this.savedFilters.getValue().find(filter => filter.id === profile.activeFilterId);
        if (snapshot) {
          filtersToApply = {
            ...snapshot.filters,
            savedFilterId: snapshot.id
          };
        }
      }

      this.hydratingFilters = true;
      if (filtersToApply) {
        this.filters.next(filtersToApply);
      } else if (!this.activeFilterId) {
        this.filters.next({});
      }
      this.hydratingFilters = false;
    });

    const savedFiltersSubscription = this.preferences.savedFilters$.subscribe(filters => {
      this.savedFilters.next(filters);

      if (this.activeFilterId && !filters.some(filter => filter.id === this.activeFilterId)) {
        this.activeFilterId = null;
        this.hydratingFilters = true;
        this.filters.next({ ...this.currentFilters, savedFilterId: null });
        this.hydratingFilters = false;
      }
    });

    this.subscriptions.push(profileSubscription, savedFiltersSubscription);
  }

  private withoutMetadata(filter: NewsFilter): NewsFilter {
    const { savedFilterId: _savedFilterId, ...rest } = filter;
    return {
      ...rest,
      topics: rest.topics ? [...rest.topics] : undefined,
      dateFrom: rest.dateFrom ? new Date(rest.dateFrom) : undefined,
      dateTo: rest.dateTo ? new Date(rest.dateTo) : undefined
    };
  }

  private areFiltersEqual(a: NewsFilter, b: NewsFilter): boolean {
    const normalizedA = this.withoutMetadata(a);
    const normalizedB = this.withoutMetadata(b);

    return (
      (normalizedA.source ?? '') === (normalizedB.source ?? '') &&
      (normalizedA.category ?? '') === (normalizedB.category ?? '') &&
      this.compareDate(normalizedA.dateFrom, normalizedB.dateFrom) &&
      this.compareDate(normalizedA.dateTo, normalizedB.dateTo) &&
      (normalizedA.searchTerm?.toLowerCase().trim() ?? '') === (normalizedB.searchTerm?.toLowerCase().trim() ?? '') &&
      this.compareTopics(normalizedA.topics, normalizedB.topics) &&
      (normalizedA.onlyFollowedTopics ?? false) === (normalizedB.onlyFollowedTopics ?? false)
    );
  }

  private compareDate(a?: Date, b?: Date): boolean {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.getTime() === b.getTime();
  }

  private compareTopics(a?: string[], b?: string[]): boolean {
    if (!a?.length && !b?.length) {
      return true;
    }
    if (!a || !b) {
      return false;
    }

    const normalize = (topics: string[]) => [...new Set(topics.map(topic => topic.toLowerCase().trim()))].sort();
    const normalizedA = normalize(a);
    const normalizedB = normalize(b);

    if (normalizedA.length !== normalizedB.length) {
      return false;
    }

    return normalizedA.every((topic, index) => topic === normalizedB[index]);
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
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
