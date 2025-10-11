import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PollQuestion, EngagementEventPayload } from '../models/engagement.model';
import { NewsItem } from '../models/news.model';

interface PollResponse {
  polls: PollQuestion[];
}

@Injectable({
  providedIn: 'root'
})
export class EngagementService {
  private readonly baseUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) { }

  fetchPollResults(): Observable<PollQuestion[]> {
    return this.http.get<PollResponse>(`${this.baseUrl}/polls`).pipe(
      map(response => response.polls),
      catchError(error => {
        console.error('Failed to load poll results', error);
        return of([]);
      })
    );
  }

  submitNewsletterSignup(email: string, storyId?: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/newsletter/signup`, { email, storyId }).pipe(
      catchError(error => {
        console.error('Failed to submit newsletter signup', error);
        throw error;
      })
    );
  }

  trackEvent(eventName: string, payload: EngagementEventPayload = {}): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/analytics/events`, { eventName, payload }).pipe(
      catchError(error => {
        console.error('Failed to track engagement event', error);
        return of(void 0);
      })
    );
  }

  buildOgImageUrl(story: NewsItem): string {
    const params = new URLSearchParams({
      title: story.title,
      source: story.source || 'Campaign Tracker',
      date: story.pubDate.toISOString()
    });
    return `${this.baseUrl}/og-image?${params.toString()}`;
  }
}
