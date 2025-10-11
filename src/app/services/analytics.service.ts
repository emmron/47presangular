import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NewsItem } from '../models/news.model';
import { UserIdentityService } from './user-identity.service';

interface AnalyticsPayload {
  type: 'click' | 'save' | 'dwell';
  itemId: string;
  dwellTimeMs?: number;
  metadata?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private dwellTimers = new Map<string, number>();
  private eventsSubject = new Subject<AnalyticsPayload>();

  readonly events$ = this.eventsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private userIdentity: UserIdentityService
  ) {}

  trackClick(item: NewsItem, metadata: Record<string, unknown> = {}): void {
    this.dispatch({ type: 'click', itemId: item.id, metadata }, item);
  }

  trackSave(item: NewsItem, saved: boolean, metadata: Record<string, unknown> = {}): void {
    this.dispatch({ type: 'save', itemId: item.id, metadata: { ...metadata, saved } }, item);
  }

  startDwell(item: NewsItem): void {
    this.dwellTimers.set(item.id, this.now());
  }

  endDwell(item: NewsItem, metadata: Record<string, unknown> = {}): void {
    const start = this.dwellTimers.get(item.id);
    if (!start) {
      return;
    }
    this.dwellTimers.delete(item.id);
    const dwellTimeMs = Math.round(this.now() - start);
    if (dwellTimeMs < 250) {
      return;
    }
    this.dispatch({ type: 'dwell', itemId: item.id, dwellTimeMs, metadata }, item);
  }

  private dispatch(payload: AnalyticsPayload, item: NewsItem): void {
    const userId = this.userIdentity.ensureUserId();
    const body = {
      ...payload,
      userId,
      metadata: {
        title: item.title,
        source: item.source,
        category: item.category,
        ...payload.metadata
      }
    };

    this.http.post<unknown>('/api/analytics/events', body).pipe(
      tap(() => this.eventsSubject.next(payload)),
      catchError(() => {
        // Intentionally swallow analytics errors so they never interrupt UX
        return of(null);
      })
    ).subscribe();
  }

  private now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }
}
