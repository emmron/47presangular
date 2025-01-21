import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, forkJoin } from 'rxjs';
import { catchError, map, retryWhen, delay, take, tap } from 'rxjs/operators';
import { NewsItem } from '../models/news.model';
import { NewsStateService } from './news-state.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly CACHE_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  private newsApis = [
    {
      url: 'https://newsapi.org/v2/everything',
      params: {
        q: 'Trump AND (campaign OR election OR 2024)',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: 'YOUR_API_KEY' // Replace with your NewsAPI key
      }
    },
    {
      url: 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
      params: {
        q: 'Trump presidential campaign 2024',
        sort: 'newest',
        'api-key': 'YOUR_API_KEY' // Replace with your NYTimes API key
      }
    }
  ];

  constructor(
    private http: HttpClient,
    private stateService: NewsStateService
  ) {
    // Auto-refresh data periodically
    this.setupAutoRefresh();
  }

  fetchNews(): Observable<NewsItem[]> {
    this.stateService.setLoading(true);

    const requests = this.newsApis.map(api =>
      this.fetchFromApi(api.url, api.params)
    );

    return forkJoin(requests).pipe(
      map((responses: any[]) => this.processResponses(responses)),
      tap(items => {
        this.stateService.setItems(items);
        this.stateService.setLoading(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  private fetchFromApi(url: string, params: any): Observable<any> {
    return this.http.get(url, { params }).pipe(
      retryWhen(errors =>
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.MAX_RETRIES),
          tap(() => console.log('Retrying API request...'))
        )
      ),
      catchError(error => this.handleError(error))
    );
  }

  private processResponses(responses: any[]): NewsItem[] {
    const items: NewsItem[] = [];

    responses.forEach((response, index) => {
      const source = this.newsApis[index].url;
      const processedItems = this.processApiResponse(response, source);
      items.push(...processedItems);
    });

    return items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }

  private processApiResponse(response: any, source: string): NewsItem[] {
    // Process based on the API source
    if (source.includes('newsapi.org')) {
      return response.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        link: article.url,
        pubDate: new Date(article.publishedAt),
        content: article.description,
        source: article.source.name,
        imageUrl: article.urlToImage
      }));
    } else if (source.includes('nytimes.com')) {
      return response.response.docs.map((doc: any) => ({
        id: doc._id,
        title: doc.headline.main,
        link: doc.web_url,
        pubDate: new Date(doc.pub_date),
        content: doc.abstract,
        source: 'The New York Times',
        category: doc.section_name
      }));
    }
    return [];
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    this.stateService.setError(errorMessage);
    this.stateService.setLoading(false);
    return throwError(() => new Error(errorMessage));
  }

  private setupAutoRefresh(): void {
    timer(this.CACHE_TIME, this.CACHE_TIME).subscribe(() => {
      if (!this.stateService.currentState.loading) {
        this.fetchNews().subscribe();
      }
    });
  }
}
