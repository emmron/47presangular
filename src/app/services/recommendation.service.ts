import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, switchMap, startWith } from 'rxjs/operators';
import { NewsItem } from '../models/news.model';
import { RecommendationFeed, RecommendationApiResponse } from '../models/recommendation.model';
import { UserIdentityService } from './user-identity.service';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private refreshTrigger$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private userIdentity: UserIdentityService
  ) {}

  recommendations$(limit = 6): Observable<RecommendationFeed> {
    return this.refreshTrigger$.pipe(
      startWith(void 0),
      switchMap(() => this.fetchRecommendations(limit)),
      shareReplay(1)
    );
  }

  refresh(): void {
    this.refreshTrigger$.next();
  }

  private fetchRecommendations(limit: number): Observable<RecommendationFeed> {
    const userId = this.userIdentity.getUserId();
    let params = new HttpParams().set('limit', limit);
    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<RecommendationApiResponse>('/api/news/recommended', { params }).pipe(
      map(response => this.mapResponse(response))
    );
  }

  private mapResponse(response: RecommendationApiResponse): RecommendationFeed {
    const items: NewsItem[] = response.items.map(item => ({
      id: item.id,
      title: item.title,
      link: item.url,
      pubDate: new Date(item.publishedAt),
      content: item.summary,
      source: item.source,
      category: item.category,
      imageUrl: item.imageUrl,
      summary: item.summary,
      metrics: {
        recommendationScore: item.recommendationScore,
        breakdown: item.breakdown,
        strategy: response.strategy,
        cohortLabel: response.cohort?.label
      }
    }));

    return {
      requestedAt: response.requestedAt,
      userId: response.userId,
      strategy: response.strategy,
      cohort: response.cohort,
      items
    };
  }
}
