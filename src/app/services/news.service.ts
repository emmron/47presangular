import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, forkJoin } from 'rxjs';
import { catchError, map, retryWhen, delay, take, tap } from 'rxjs/operators';
import { MediaAsset, NewsItem, NewsResponse, SourceType } from '../models/news.model';
import { NewsStateService } from './news-state.service';

interface ExternalMediaAsset extends MediaAsset {
  width?: number | null;
  height?: number | null;
}

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
        const response: NewsResponse = {
          items,
          total: items.length,
          page: 1,
          pageSize: items.length || 1,
        };
        this.stateService.setItems(response);
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

    return items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  private processApiResponse(response: any, source: string): NewsItem[] {
    if (source.includes('newsapi.org')) {
      return (response.articles ?? []).map((article: any) => this.createNewsItem({
        id: article.url,
        title: article.title,
        summary: article.description,
        content: article.content,
        link: article.url,
        publishedAt: article.publishedAt,
        sourceName: article.source?.name ?? 'News API',
        sourceSlug: this.slugify(article.source?.name ?? 'newsapi'),
        sourceType: 'LICENSED',
        sourceUrl: article.url,
        author: article.author,
        media: article.urlToImage
          ? [{ url: article.urlToImage, type: 'IMAGE', caption: article.title }]
          : [],
      }));
    }

    if (source.includes('nytimes.com')) {
      return (response.response?.docs ?? []).map((doc: any) => this.createNewsItem({
        id: doc._id,
        title: doc.headline?.main,
        summary: doc.abstract,
        content: doc.lead_paragraph,
        link: doc.web_url,
        publishedAt: doc.pub_date,
        sourceName: 'New York Times',
        sourceSlug: 'nytimes',
        sourceType: 'LICENSED',
        sourceUrl: doc.web_url,
        author: doc.byline?.original,
        topics: (doc.keywords ?? []).map((keyword: any) => this.slugify(keyword.value)),
        media: Array.isArray(doc.multimedia)
          ? doc.multimedia
              .filter((media: any) => Boolean(media.url))
              .map((media: any) => ({
                url: media.url.startsWith('http') ? media.url : `https://www.nytimes.com/${media.url}`,
                type: 'IMAGE' as const,
                caption: media.caption,
                width: media.width,
                height: media.height,
              }))
          : [],
      }));
    }

    return [];
  }

  private createNewsItem(params: {
    id: string;
    title: string;
    summary?: string | null;
    content?: string | null;
    link: string;
    publishedAt: string;
    sourceName: string;
    sourceSlug: string;
    sourceType: SourceType;
    sourceUrl?: string;
    author?: string;
    topics?: string[];
    media?: ExternalMediaAsset[];
  }): NewsItem {
    return {
      id: params.id,
      title: params.title,
      summary: params.summary ?? undefined,
      content: params.content ?? undefined,
      link: params.link,
      publishedAt: new Date(params.publishedAt),
      source: {
        name: params.sourceName,
        slug: params.sourceSlug,
        type: params.sourceType,
        url: params.sourceUrl,
        author: params.author,
      },
      topics: params.topics ?? [],
      mediaAssets: (params.media ?? []).map(asset => ({
        url: asset.url,
        type: asset.type,
        caption: asset.caption,
        width: asset.width ?? undefined,
        height: asset.height ?? undefined,
      })),
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .replace(/-{2,}/g, '-');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
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
