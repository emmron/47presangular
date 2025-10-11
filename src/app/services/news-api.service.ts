import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { NewsItem } from '../models/news.model';
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
