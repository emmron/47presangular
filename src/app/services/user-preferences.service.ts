import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PostgrestError } from '@supabase/supabase-js';

import { NewsFilter, NewsItem, SavedFilterSnapshot } from '../models/news.model';
import {
  AuthUser,
  NotificationPreferences,
  SavedArticleSummary,
  SavedNewsFilter,
  UserNotification,
  UserProfile
} from '../models/user.model';
import { SupabaseClientService } from './supabase-client.service';
import { AuthService } from './auth.service';

interface LocalPreferenceStore {
  profile: UserProfile;
  savedFilters: SavedNewsFilter[];
  savedArticles: SavedArticleSummary[];
  notifications: UserNotification[];
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly STORAGE_KEY = 'trump-tracker-preferences';

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  private savedFiltersSubject = new BehaviorSubject<SavedNewsFilter[]>([]);
  private savedArticlesSubject = new BehaviorSubject<SavedArticleSummary[]>([]);
  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);

  private pendingFilterPersist$ = new Subject<{ filters: NewsFilter; filterId?: string | null }>();

  readonly profile$: Observable<UserProfile | null> = this.profileSubject.asObservable();
  readonly savedFilters$: Observable<SavedNewsFilter[]> = this.savedFiltersSubject.asObservable();
  readonly savedArticles$: Observable<SavedArticleSummary[]> = this.savedArticlesSubject.asObservable();
  readonly notifications$: Observable<UserNotification[]> = this.notificationsSubject.asObservable();

  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly auth: AuthService
  ) {
    this.auth.user$.subscribe(user => {
      if (user) {
        void this.hydrateForUser(user);
      } else {
        this.clearState();
      }
    });

    this.pendingFilterPersist$
      .pipe(debounceTime(800))
      .subscribe(payload => {
        void this.persistActiveFilters(payload.filters, payload.filterId);
      });
  }

  get currentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  get currentUser(): AuthUser | null {
    return this.auth.currentUser;
  }

  get savedFiltersSnapshot(): SavedNewsFilter[] {
    return this.savedFiltersSubject.value;
  }

  get savedArticlesSnapshot(): SavedArticleSummary[] {
    return this.savedArticlesSubject.value;
  }

  get notificationsSnapshot(): UserNotification[] {
    return this.notificationsSubject.value;
  }

  isArticleSaved(articleId: string): boolean {
    return this.savedArticlesSubject.value.some(article => article.articleId === articleId);
  }

  queuePersistActiveFilters(filters: NewsFilter, filterId?: string | null): void {
    this.pendingFilterPersist$.next({ filters, filterId });
  }

  async createSavedFilter(name: string, filters: NewsFilter): Promise<SavedNewsFilter | null> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('User must be signed in to save filters');
    }

    const payload = this.createSavedFilterPayload(name, filters);

    if (!this.supabase.isConfigured) {
      const savedFilter: SavedNewsFilter = { ...payload, id: globalThis.crypto?.randomUUID?.() ?? Date.now().toString(), filters };
      this.updateLocalStore(user.id, store => {
        store.savedFilters = [...store.savedFilters, savedFilter];
      });
      this.savedFiltersSubject.next([...this.savedFiltersSubject.value, savedFilter]);
      return savedFilter;
    }

    const client = this.supabase.getClient();
    const { data, error } = await client.from('saved_filters').insert({
      user_id: user.id,
      name,
      filters: this.serializeFilter(filters)
    }).select().single();

    if (error) {
      this.handleError('Failed to create saved filter', error);
      return null;
    }

    const savedFilter = this.mapSavedFilter(data);
    this.savedFiltersSubject.next([...this.savedFiltersSubject.value, savedFilter]);
    await this.persistCache();
    return savedFilter;
  }

  async updateSavedFilter(id: string, filters: NewsFilter): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('User must be signed in to update filters');
    }

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.savedFilters = store.savedFilters.map(filter =>
          filter.id === id ? { ...filter, filters } : filter
        );
      });
      this.savedFiltersSubject.next(this.savedFiltersSubject.value.map(filter =>
        filter.id === id ? { ...filter, filters } : filter
      ));
      return;
    }

    const client = this.supabase.getClient();
    const { error } = await client.from('saved_filters').update({
      filters: this.serializeFilter(filters)
    }).eq('id', id);

    if (error) {
      this.handleError('Failed to update saved filter', error);
      return;
    }

    this.savedFiltersSubject.next(this.savedFiltersSubject.value.map(filter =>
      filter.id === id ? { ...filter, filters } : filter
    ));
    await this.persistCache();
  }

  async deleteSavedFilter(id: string): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('User must be signed in to delete filters');
    }

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.savedFilters = store.savedFilters.filter(filter => filter.id !== id);
      });
      this.savedFiltersSubject.next(this.savedFiltersSubject.value.filter(filter => filter.id !== id));
      return;
    }

    const client = this.supabase.getClient();
    const { error } = await client.from('saved_filters').delete().eq('id', id);
    if (error) {
      this.handleError('Failed to delete saved filter', error);
      return;
    }

    this.savedFiltersSubject.next(this.savedFiltersSubject.value.filter(filter => filter.id !== id));
    await this.persistCache();
  }

  async setActiveFilter(filterId: string | null): Promise<void> {
    const profile = this.currentProfile;
    const user = this.currentUser;
    if (!profile || !user) {
      return;
    }

    const updatedProfile: UserProfile = { ...profile, activeFilterId: filterId };
    this.profileSubject.next(updatedProfile);

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.profile = updatedProfile;
      });
      return;
    }

    const { error } = await this.supabase.getClient()
      .from('profiles')
      .update({ active_filter_id: filterId })
      .eq('id', user.id);

    if (error) {
      this.handleError('Failed to update active filter', error);
    } else {
      await this.persistCache();
    }
  }

  async persistActiveFilters(filters: NewsFilter, filterId?: string | null): Promise<void> {
    const profile = this.currentProfile;
    const user = this.currentUser;
    if (!profile || !user) {
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      activeFilters: filters,
      activeFilterId: filterId ?? profile.activeFilterId ?? null,
      lastSyncedAt: new Date().toISOString()
    };
    this.profileSubject.next(updatedProfile);

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.profile = updatedProfile;
      });
      return;
    }

    const { error } = await this.supabase.getClient()
      .from('profiles')
      .update({
        active_filters: this.serializeFilter(filters),
        active_filter_id: filterId ?? profile.activeFilterId ?? null,
        last_synced_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      this.handleError('Failed to persist active filters', error);
    } else {
      await this.persistCache();
    }
  }

  async saveArticle(item: NewsItem): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('User must be signed in to save articles');
    }

    const summary = this.mapNewsItemToSummary(item);

    if (this.isArticleSaved(item.id)) {
      return;
    }

    if (!this.supabase.isConfigured) {
      const savedArticle: SavedArticleSummary = {
        id: globalThis.crypto?.randomUUID?.() ?? Date.now().toString(),
        articleId: item.id,
        savedAt: new Date().toISOString(),
        item: summary.item
      };
      this.updateLocalStore(user.id, store => {
        store.savedArticles = [savedArticle, ...store.savedArticles];
      });
      this.savedArticlesSubject.next([savedArticle, ...this.savedArticlesSubject.value]);
      return;
    }

    const { error, data } = await this.supabase.getClient().from('saved_articles').insert({
      user_id: user.id,
      article_id: item.id,
      article: summary.item,
      saved_at: new Date().toISOString()
    }).select().single();

    if (error) {
      this.handleError('Failed to save article', error);
      return;
    }

    const savedArticle: SavedArticleSummary = {
      id: data.id,
      articleId: data.article_id,
      savedAt: data.saved_at,
      item: data.article
    };

    this.savedArticlesSubject.next([savedArticle, ...this.savedArticlesSubject.value]);
    await this.persistCache();
  }

  async removeSavedArticle(articleId: string): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      return;
    }

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.savedArticles = store.savedArticles.filter(article => article.articleId !== articleId);
      });
      this.savedArticlesSubject.next(this.savedArticlesSubject.value.filter(article => article.articleId !== articleId));
      return;
    }

    const { error } = await this.supabase.getClient().from('saved_articles')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);

    if (error) {
      this.handleError('Failed to remove saved article', error);
      return;
    }

    this.savedArticlesSubject.next(this.savedArticlesSubject.value.filter(article => article.articleId !== articleId));
    await this.persistCache();
  }

  async updateFollowTopics(topics: string[]): Promise<void> {
    const profile = this.currentProfile;
    const user = this.currentUser;
    if (!profile || !user) {
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      followTopics: [...new Set(topics.map(topic => topic.trim()).filter(Boolean))]
    };

    this.profileSubject.next(updatedProfile);

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.profile = updatedProfile;
      });
      return;
    }

    const { error } = await this.supabase.getClient()
      .from('profiles')
      .update({ follow_topics: updatedProfile.followTopics })
      .eq('id', user.id);

    if (error) {
      this.handleError('Failed to update follow topics', error);
    } else {
      await this.persistCache();
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    const profile = this.currentProfile;
    const user = this.currentUser;
    if (!profile || !user) {
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      notificationPreferences: preferences
    };

    this.profileSubject.next(updatedProfile);

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.profile = updatedProfile;
      });
      return;
    }

    const { error } = await this.supabase.getClient()
      .from('profiles')
      .update({ notification_preferences: preferences })
      .eq('id', user.id);

    if (error) {
      this.handleError('Failed to update notification preferences', error);
    } else {
      await this.persistCache();
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      return;
    }

    const notifications = this.notificationsSubject.value.map(notification =>
      notification.id === id ? { ...notification, readAt: new Date().toISOString() } : notification
    );
    this.notificationsSubject.next(notifications);

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.notifications = notifications;
      });
      return;
    }

    const { error } = await this.supabase.getClient()
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      this.handleError('Failed to mark notification as read', error);
    } else {
      await this.persistCache();
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      return;
    }

    const notifications = this.notificationsSubject.value.map(notification => ({
      ...notification,
      readAt: notification.readAt ?? new Date().toISOString()
    }));
    this.notificationsSubject.next(notifications);

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.notifications = notifications;
      });
      return;
    }

    const { error } = await this.supabase.getClient()
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (error) {
      this.handleError('Failed to mark notifications as read', error);
    } else {
      await this.persistCache();
    }
  }

  private async hydrateForUser(user: AuthUser): Promise<void> {
    if (!user.id) {
      return;
    }

    if (!this.supabase.isConfigured) {
      this.loadFromLocalStore(user.id, user.email ?? '');
      return;
    }

    try {
      const client = this.supabase.getClient();
      const [profileResponse, filtersResponse, articlesResponse, notificationsResponse] = await Promise.all([
        client.from('profiles')
          .select('id,email,display_name,avatar_url,follow_topics,notification_preferences,active_filter_id,active_filters,last_synced_at')
          .eq('id', user.id)
          .maybeSingle(),
        client.from('saved_filters')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        client.from('saved_articles')
          .select('*')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false })
          .limit(50),
        client.from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') {
        this.handleError('Failed to load profile', profileResponse.error);
      }

      let profile = profileResponse.data ? this.mapProfile(profileResponse.data) : null;
      if (!profile) {
        profile = await this.ensureProfile(user);
      }

      const savedFilters = (filtersResponse.data ?? []).map(record => this.mapSavedFilter(record));
      const savedArticles = (articlesResponse.data ?? []).map(record => this.mapSavedArticle(record));
      const notifications = (notificationsResponse.data ?? []).map(record => this.mapNotification(record));

      this.profileSubject.next(profile);
      this.savedFiltersSubject.next(savedFilters);
      this.savedArticlesSubject.next(savedArticles);
      this.notificationsSubject.next(notifications);

      await this.persistCache();
    } catch (error) {
      console.error('Failed to hydrate user preferences', error);
    }
  }

  private mapProfile(record: any): UserProfile {
    const preferences = record.notification_preferences as NotificationPreferences | null;
    const filters = record.active_filters as NewsFilter | null;
    return {
      id: record.id,
      email: record.email,
      displayName: record.display_name ?? undefined,
      avatarUrl: record.avatar_url ?? undefined,
      followTopics: Array.isArray(record.follow_topics) ? record.follow_topics : [],
      notificationPreferences: preferences ?? {
        emailDigest: false,
        pushNotifications: false,
        digestFrequency: 'weekly'
      },
      activeFilterId: record.active_filter_id ?? null,
      activeFilters: filters ? this.deserializeFilter(filters) : null,
      lastSyncedAt: record.last_synced_at ?? null
    };
  }

  private mapSavedFilter(record: any): SavedNewsFilter {
    const filters = this.deserializeFilter(record.filters ?? {});
    const snapshot: SavedFilterSnapshot = {
      id: record.id,
      name: record.name,
      filters,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      isDefault: record.is_default ?? false
    };
    return {
      id: snapshot.id,
      name: snapshot.name,
      filters: snapshot.filters,
      isDefault: snapshot.isDefault,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }

  private mapSavedArticle(record: any): SavedArticleSummary {
    return {
      id: record.id,
      articleId: record.article_id,
      savedAt: record.saved_at,
      item: {
        title: record.article?.title ?? 'Untitled',
        link: record.article?.link ?? '#',
        source: record.article?.source ?? 'Unknown source',
        pubDate: record.article?.pubDate ?? new Date().toISOString(),
        category: record.article?.category ?? undefined,
        imageUrl: record.article?.imageUrl ?? undefined,
        excerpt: record.article?.excerpt ?? record.article?.content ?? ''
      }
    };
  }

  private mapNotification(record: any): UserNotification {
    return {
      id: record.id,
      title: record.title,
      body: record.body,
      type: record.type ?? 'system',
      createdAt: record.created_at,
      readAt: record.read_at ?? null,
      link: record.link ?? undefined,
      metadata: record.metadata ?? null
    };
  }

  private mapNewsItemToSummary(item: NewsItem): SavedArticleSummary {
    return {
      id: globalThis.crypto?.randomUUID?.() ?? `${item.id}-${Date.now()}`,
      articleId: item.id,
      savedAt: new Date().toISOString(),
      item: {
        title: item.title,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate.toISOString(),
        category: item.category,
        imageUrl: item.imageUrl,
        excerpt: item.content?.slice(0, 280)
      }
    };
  }

  private serializeFilter(filter: NewsFilter): any {
    return {
      ...filter,
      dateFrom: filter.dateFrom ? filter.dateFrom.toISOString() : null,
      dateTo: filter.dateTo ? filter.dateTo.toISOString() : null
    };
  }

  private deserializeFilter(record: any): NewsFilter {
    return {
      ...record,
      dateFrom: record?.dateFrom ? new Date(record.dateFrom) : undefined,
      dateTo: record?.dateTo ? new Date(record.dateTo) : undefined,
      topics: Array.isArray(record?.topics) ? record.topics : undefined,
      savedFilterId: record?.savedFilterId ?? record?.id ?? null,
      onlyFollowedTopics: record?.onlyFollowedTopics ?? false
    };
  }

  private async ensureProfile(user: AuthUser): Promise<UserProfile> {
    const profile: UserProfile = {
      id: user.id,
      email: user.email ?? `${user.id}@example.com`,
      displayName: user.fullName ?? user.email ?? 'Anonymous',
      followTopics: [],
      notificationPreferences: {
        emailDigest: false,
        pushNotifications: false,
        digestFrequency: 'weekly'
      },
      activeFilterId: null,
      activeFilters: null,
      lastSyncedAt: new Date().toISOString()
    };

    if (!this.supabase.isConfigured) {
      this.updateLocalStore(user.id, store => {
        store.profile = profile;
      });
      this.profileSubject.next(profile);
      return profile;
    }

    const { error } = await this.supabase.getClient().from('profiles').upsert({
      id: user.id,
      email: profile.email,
      display_name: profile.displayName,
      avatar_url: user.avatarUrl,
      follow_topics: profile.followTopics,
      notification_preferences: profile.notificationPreferences,
      active_filter_id: profile.activeFilterId,
      active_filters: profile.activeFilters,
      last_synced_at: profile.lastSyncedAt
    }, { onConflict: 'id' });

    if (error) {
      this.handleError('Failed to ensure profile', error);
    }

    this.profileSubject.next(profile);
    await this.persistCache();
    return profile;
  }

  private loadFromLocalStore(userId: string, email: string): void {
    const store = this.getLocalStore();
    const entry = store[userId];
    if (!entry) {
      const profile: UserProfile = {
        id: userId,
        email,
        followTopics: [],
        notificationPreferences: {
          emailDigest: false,
          pushNotifications: false,
          digestFrequency: 'weekly'
        },
        activeFilterId: null,
        activeFilters: null,
        lastSyncedAt: null
      };
      this.profileSubject.next(profile);
      this.savedFiltersSubject.next([]);
      this.savedArticlesSubject.next([]);
      this.notificationsSubject.next([]);
      this.persistLocalStore(userId, {
        profile,
        savedFilters: [],
        savedArticles: [],
        notifications: []
      });
      return;
    }

    this.profileSubject.next(entry.profile);
    this.savedFiltersSubject.next(entry.savedFilters);
    this.savedArticlesSubject.next(entry.savedArticles);
    this.notificationsSubject.next(entry.notifications);
  }

  private updateLocalStore(userId: string, mutator: (store: LocalPreferenceStore) => void): void {
    const store = this.getLocalStore();
    if (!store[userId]) {
      store[userId] = {
        profile: {
          id: userId,
          email: this.currentUser?.email ?? `${userId}@example.com`,
          followTopics: [],
          notificationPreferences: {
            emailDigest: false,
            pushNotifications: false,
            digestFrequency: 'weekly'
          },
          activeFilterId: null,
          activeFilters: null,
          lastSyncedAt: null
        },
        savedFilters: [],
        savedArticles: [],
        notifications: []
      };
    }

    mutator(store[userId]);
    this.setLocalStore(store);
  }

  private async persistCache(): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    if (!this.supabase.isConfigured) {
      return;
    }

    const userId = this.currentUser.id;
    const store: LocalPreferenceStore = {
      profile: this.profileSubject.value!,
      savedFilters: this.savedFiltersSubject.value,
      savedArticles: this.savedArticlesSubject.value,
      notifications: this.notificationsSubject.value
    };

    this.persistLocalStore(userId, store);
  }

  private persistLocalStore(userId: string, storeValue: LocalPreferenceStore): void {
    const store = this.getLocalStore();
    store[userId] = storeValue;
    this.setLocalStore(store);
  }

  private getLocalStore(): Record<string, LocalPreferenceStore> {
    if (typeof window === 'undefined') {
      return {};
    }

    const raw = window.localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as Record<string, LocalPreferenceStore>;
    } catch (error) {
      console.warn('Failed to parse local preferences store', error);
      return {};
    }
  }

  private setLocalStore(store: Record<string, LocalPreferenceStore>): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
  }

  private createSavedFilterPayload(name: string, filters: NewsFilter): Omit<SavedNewsFilter, 'filters'> & { filters: NewsFilter } {
    return {
      id: globalThis.crypto?.randomUUID?.() ?? Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false
    };
  }

  private clearState(): void {
    this.profileSubject.next(null);
    this.savedFiltersSubject.next([]);
    this.savedArticlesSubject.next([]);
    this.notificationsSubject.next([]);
  }

  private handleError(message: string, error: PostgrestError | Error): void {
    console.error(message, error);
  }
}
