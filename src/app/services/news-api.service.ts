import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { NewsItem, StoryDetail, StorySource, TimelineEvent } from '../models/news.model';
import { LoadingState, toLoadingState } from '../models/loading-state.model';

interface NewsItemResponse {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  category?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {
  private readonly API_URL = '/api/news';

  constructor(private http: HttpClient) {}

  getNews(forceRefresh = false): Observable<LoadingState<NewsItem[]>> {
    const params = forceRefresh ? { refresh: 'true' } : undefined;

    return toLoadingState(
      this.http
        .get<NewsItemResponse[]>(this.API_URL, { params })
        .pipe(
          retry(2),
          map((response) => this.transformResponse(response)),
          catchError((error) => this.handleError(error))
        )
    );
  }

  private transformResponse(items: NewsItemResponse[]): NewsItem[] {
    return items.map((item) => ({
      ...item,
      pubDate: new Date(item.pubDate)
    }));
  getStoryDetail(id: string): Observable<StoryDetail> {
    return this.http.get<any>(`/api/news/${id}`).pipe(
      map(response => this.transformStoryDetail(response)),
      catchError(this.handleError)
    );
  }

  private transformRedditResponse(response: any): NewsItem[] {
    if (!response?.data?.children) {
      throw new Error('Invalid Reddit API response format');
    }

    return response.data.children
      .filter((post: any) => post.data && !post.data.over_18) // Filter out NSFW content
      .map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        link: 'https://reddit.com' + post.data.permalink,
        pubDate: new Date(post.data.created_utc * 1000),
        content: post.data.selftext || post.data.url,
        source: post.data.subreddit_name_prefixed,
        imageUrl: this.getPostImage(post.data),
        category: post.data.link_flair_text || 'News'
      }));
  }

  private transformStoryDetail(response: any): StoryDetail {
    if (!response) {
      throw new Error('Invalid story response');
    }

    const summary = Array.isArray(response.summary)
      ? response.summary.filter(Boolean)
      : response.summary
      ? [response.summary]
      : [];

    const sources: StorySource[] = Array.isArray(response.sources)
      ? response.sources
          .filter((source: any) => source)
          .map((source: any) => ({
            name: source.name ?? source.title ?? 'Source',
            url: source.url ?? source.link ?? '',
            type: source.type,
            summary: source.summary ?? source.excerpt
          }))
          .filter((source: StorySource) => !!source.url)
      : [];

    const timelineEvents: TimelineEvent[] = Array.isArray(response.timelineEvents)
      ? response.timelineEvents
          .filter((event: any) => event)
          .map((event: any) => ({
            date: event.date ?? event.timestamp ?? '',
            headline: event.headline ?? event.title ?? 'Campaign milestone',
            description: event.description ?? event.summary
          }))
          .filter((event: TimelineEvent) => !!event.date && !!event.headline)
      : [];

    return {
      id: response.id ?? response.articleId ?? '',
      title: response.title ?? 'Campaign story',
      link: response.link ?? response.url ?? '',
      pubDate: response.pubDate ? new Date(response.pubDate) : new Date(),
      content: response.content ?? response.summary ?? '',
      source: response.source ?? response.primarySource ?? 'Campaign coverage',
      category: response.category,
      imageUrl: response.imageUrl ?? response.image,
      summary,
      sources,
      timelineEvents
    };
  }

  private getPostImage(postData: any): string | undefined {
    if (postData.thumbnail && postData.thumbnail !== 'self' && postData.thumbnail !== 'default') {
      return postData.thumbnail;
    }
    if (postData.preview?.images?.[0]?.source?.url) {
      return postData.preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    return undefined;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unable to load news at this time.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      const detail = typeof error.error.detail === 'string' ? `: ${error.error.detail}` : '';
      errorMessage = `${error.error.message}${detail}`;
    } else if (error.status === 0) {
      errorMessage = 'News service is unreachable. Please check your network connection.';
    } else {
      errorMessage = `News service error ${error.status}: ${error.statusText || 'Unknown error'}`;
    }

    console.error('News API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
