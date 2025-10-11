import { Injectable } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, OperatorFunction, reduce } from 'rxjs';
import { map } from 'rxjs/operators';

import { NewsItem } from '../models/news.model';
import { newsAggregationConfig } from '../config/news-source.config';

interface CachedEntry {
  timestamp: number;
  items: CachedNewsItem[];
}

interface CachedNewsItem extends Omit<NewsItem, 'pubDate'> {
  pubDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsCacheService {
  private readonly DB_NAME = 'news-aggregation-cache';
  private readonly STORE_NAME = 'news-items';
  private readonly CACHE_KEY = 'aggregated';
  private readonly TTL = newsAggregationConfig.cacheTtlMs;
  private dbPromise: Promise<IDBDatabase> | null = null;

  async getCachedNews(): Promise<NewsItem[] | null> {
    try {
      const entry = await this.readFromIndexedDb();
      if (!entry) {
        return this.readFromLocalStorage();
      }
      if (Date.now() - entry.timestamp > this.TTL) {
        await this.clearInternal();
        return null;
      }
      return entry.items.map((item) => ({
        ...item,
        pubDate: new Date(item.pubDate)
      }));
    } catch {
      return this.readFromLocalStorage();
    }
  }

  async setCachedNews(items: NewsItem[]): Promise<void> {
    const entry: CachedEntry = {
      timestamp: Date.now(),
      items: items.map((item) => ({
        ...item,
        pubDate: item.pubDate.toISOString()
      }))
    };

    try {
      await this.writeToIndexedDb(entry);
    } catch {
      this.writeToLocalStorage(entry);
    }
  }

  dedupeByUrl(): MonoTypeOperatorFunction<NewsItem> {
    const seen = new Map<string, string>();
    return (source$) => source$.pipe(
      filterUnique((item) => {
        const urlKey = this.normalizeUrl(item.link);
        const existingHash = seen.get(urlKey);
        const hash = this.hashItem(item);
        if (existingHash && existingHash === hash) {
          return false;
        }
        seen.set(urlKey, hash);
        return true;
      })
    );
  }

  recombineSorted(): OperatorFunction<NewsItem, NewsItem[]> {
    return (source$) =>
      source$.pipe(
        reduce((acc, item) => {
          acc.push(item);
          return acc;
        }, [] as NewsItem[]),
        map((items) =>
          items.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0) ||
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        )
      );
  }

  private normalizeUrl(url: string): string {
    try {
      const normalized = new URL(url);
      normalized.hash = '';
      normalized.searchParams.sort();
      return normalized.toString();
    } catch {
      return url;
    }
  }

  private hashItem(item: NewsItem): string {
    const data = `${item.title}|${item.link}|${item.pubDate.toISOString()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  }

  private async readFromIndexedDb(): Promise<CachedEntry | null> {
    if (!this.supportsIndexedDb()) {
      return null;
    }
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(this.CACHE_KEY);
      request.onsuccess = () => resolve((request.result as CachedEntry) ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  private async writeToIndexedDb(entry: CachedEntry): Promise<void> {
    if (!this.supportsIndexedDb()) {
      throw new Error('IndexedDB unavailable');
    }
    const db = await this.getDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(entry, this.CACHE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private readFromLocalStorage(): NewsItem[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(this.localStorageKey());
    if (!raw) {
      return null;
    }
    try {
      const entry = JSON.parse(raw) as CachedEntry;
      if (Date.now() - entry.timestamp > this.TTL) {
        localStorage.removeItem(this.localStorageKey());
        return null;
      }
      return entry.items.map((item) => ({
        ...item,
        pubDate: new Date(item.pubDate)
      }));
    } catch {
      localStorage.removeItem(this.localStorageKey());
      return null;
    }
  }

  private writeToLocalStorage(entry: CachedEntry): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.localStorageKey(), JSON.stringify(entry));
  }

  async clearCache(): Promise<void> {
    await this.clearInternal();
  }

  private async clearInternal(): Promise<void> {
    if (this.supportsIndexedDb()) {
      const db = await this.getDb();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(this.CACHE_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.localStorageKey());
    }
  }

  private supportsIndexedDb(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  private getDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  private localStorageKey(): string {
    return `${this.DB_NAME}:${this.STORE_NAME}:${this.CACHE_KEY}`;
  }
}

function filterUnique<T>(predicate: (value: T) => boolean): MonoTypeOperatorFunction<T> {
  return (source$) => new Observable<T>((subscriber) =>
    source$.subscribe({
      next: (value) => {
        try {
          if (predicate(value)) {
            subscriber.next(value);
          }
        } catch (error) {
          subscriber.error(error);
        }
      },
      error: (error) => subscriber.error(error),
      complete: () => subscriber.complete()
    })
  );
}
