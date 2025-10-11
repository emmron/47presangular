import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { LoadingState, toLoadingState } from '../models/loading-state.model';
import { MediaAsset, NewsItem, NewsQueryOptions, NewsResponse } from '../models/news.model';
import { environment } from '../../environments/environment';

type ApiSourceType = 'OFFICIAL' | 'LICENSED' | 'SOCIAL';
type ApiMediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

type ApiNewsItem = Omit<NewsItem, 'publishedAt' | 'mediaAssets'> & {
  publishedAt: string;
  mediaAssets: Array<MediaAsset & { type: ApiMediaType }>;
  source: NewsItem['source'] & { type: ApiSourceType };
};

type ApiNewsResponse = Omit<NewsResponse, 'items'> & {
  items: ApiNewsItem[];
};

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {
  private readonly baseUrl = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  getNews(options: NewsQueryOptions = {}): Observable<LoadingState<NewsResponse>> {
    const params = this.buildQueryParams(options);

    return toLoadingState(
      this.http.get<ApiNewsResponse>(`${this.baseUrl}/news`, { params }).pipe(
        retry({ count: 2, delay: 500 }),
        map(response => this.transformResponse(response)),
        catchError(error => this.handleError(error))
      )
    );
  }

  private buildQueryParams(options: NewsQueryOptions): HttpParams {
    let params = new HttpParams();

    if (options.page) {
      params = params.set('page', options.page.toString());
    }
    if (options.pageSize) {
      params = params.set('pageSize', options.pageSize.toString());
    }
    if (options.sources?.length) {
      params = params.set('sources', options.sources.join(','));
    }
    if (options.topics?.length) {
      params = params.set('topics', options.topics.join(','));
    }
    if (options.search) {
      params = params.set('search', options.search);
    }

    return params;
  }

  private transformResponse(response: ApiNewsResponse): NewsResponse {
    return {
      ...response,
      items: response.items.map(item => ({
        ...item,
        publishedAt: new Date(item.publishedAt),
        mediaAssets: item.mediaAssets?.map(asset => ({ ...asset })) ?? [],
      })),
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Unable to load news feed.';

    if (error.status === 0) {
      message = 'Cannot reach news service. Please verify your connection.';
    } else if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status === 429) {
      message = 'News service is receiving too many requests. Try again shortly.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return throwError(() => new Error(message));
  }
}
