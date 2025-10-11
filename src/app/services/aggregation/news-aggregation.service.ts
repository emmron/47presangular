import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, concat, defer, from, merge, of } from 'rxjs';
import { catchError, filter, map, mergeMap, tap } from 'rxjs/operators';

import { NewsItem } from '../../models/news.model';
import { LoadingState } from '../../models/loading-state.model';
import { newsAggregationConfig, ProxyEndpointConfig } from '../../config/news-source.config';
import { NewsCacheService } from '../news-cache.service';
import { TelemetryService } from '../telemetry.service';

interface SourceResult {
  source: string;
  items: NewsItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NewsAggregationService {
  private readonly config = newsAggregationConfig;

  constructor(
    private readonly http: HttpClient,
    private readonly cacheService: NewsCacheService,
    private readonly telemetry: TelemetryService
  ) {}

  aggregate(): Observable<LoadingState<NewsItem[]>> {
    return defer(() => {
      this.telemetry.logEvent('news.ingestion.started', {
        cacheTtlMs: this.config.cacheTtlMs
      });

      const cached$ = from(this.cacheService.getCachedNews()).pipe(
        map((cached) => {
          if (!cached) {
            return null;
          }
          this.telemetry.logEvent('news.ingestion.cache_hit', {
            itemCount: cached.length
          });
          return { state: 'loaded', data: cached } as LoadingState<NewsItem[]>;
        }),
        catchError((error) => {
          this.telemetry.logError(error, { stage: 'cache-read' });
          return of(null);
        })
      );

      const network$ = this.fetchAndNormalize().pipe(
        tap((items) => {
          this.cacheService.setCachedNews(items).catch((error) =>
            this.telemetry.logError(error, { stage: 'cache-write' })
          );
        }),
        map((items) => ({ state: 'loaded', data: items } as LoadingState<NewsItem[]>)),
        catchError((error) => {
          const normalizedError = error instanceof Error ? error : new Error('Failed to aggregate news');
          this.telemetry.logError(normalizedError, { stage: 'network' });
          return of({ state: 'error', error: normalizedError } as LoadingState<NewsItem[]>);
        })
      );

      return concat(
        of({ state: 'loading' } as LoadingState<NewsItem[]>),
        cached$.pipe(filter((value): value is LoadingState<NewsItem[]> => value !== null)),
        network$
      );
    });
  }

  private fetchAndNormalize(): Observable<NewsItem[]> {
    const requests = [
      this.fetchNewsApi(),
      this.fetchNyTimes(),
      this.fetchFecFilings(),
      this.fetchCampaignRss(),
      this.fetchTwitter()
    ];

    return merge(...requests).pipe(
      map((result) => result.items),
      map((items) => this.enrich(items)),
      mergeMap((items) => of(...items)),
      // Deduplicate by canonical URL/hash
      this.cacheService.dedupeByUrl(),
      map((item) => ({ ...item, relevanceScore: this.scoreItem(item) })),
      this.telemetry.collectMetrics(),
      // Recombine into array sorted by relevance and recency
      this.cacheService.recombineSorted()
    );
  }

  private fetchNewsApi(): Observable<SourceResult> {
    return this.fetchFromProxy('NewsAPI', this.config.proxies.newsApi).pipe(
      map((response: any) => {
        const articles = Array.isArray(response?.articles) ? response.articles : [];
        const items = articles.map((article: any): NewsItem => ({
          id: article.url,
          title: article.title,
          link: article.url,
          pubDate: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          content: article.description || article.content || '',
          source: article.source?.name || 'NewsAPI',
          category: article.category,
          imageUrl: article.urlToImage,
          topics: this.extractTopics(article.title, article.description),
          rawSource: 'newsapi'
        }));
        return { source: 'newsapi', items };
      })
    );
  }

  private fetchNyTimes(): Observable<SourceResult> {
    return this.fetchFromProxy('New York Times', this.config.proxies.nyTimes).pipe(
      map((response: any) => {
        const docs = Array.isArray(response?.response?.docs) ? response.response.docs : [];
        const items = docs.map((doc: any): NewsItem => ({
          id: doc._id,
          title: doc.headline?.main ?? 'Untitled',
          link: doc.web_url,
          pubDate: doc.pub_date ? new Date(doc.pub_date) : new Date(),
          content: doc.abstract || doc.lead_paragraph || '',
          source: 'The New York Times',
          category: doc.section_name,
          imageUrl: doc.multimedia?.[0]?.url,
          topics: this.extractTopics(doc.headline?.main, doc.abstract),
          rawSource: 'nytimes'
        }));
        return { source: 'nytimes', items };
      })
    );
  }

  private fetchFecFilings(): Observable<SourceResult> {
    return this.fetchFromProxy('Federal Election Commission', this.config.proxies.fecFilings).pipe(
      map((response: any) => {
        const results = Array.isArray(response?.results) ? response.results : [];
        const items = results.map((filing: any, index: number): NewsItem => ({
          id: filing.filing_id?.toString() ?? `fec-${index}`,
          title: `${filing.committee_name ?? 'Committee'} filed ${filing.document_type_full ?? 'a report'}`,
          link: filing.document_url || filing.filing_url || '#',
          pubDate: filing.receipt_date ? new Date(filing.receipt_date) : new Date(),
          content: filing.amended ? 'Amended filing' : 'New filing',
          source: 'Federal Election Commission',
          category: 'Compliance',
          topics: this.extractTopics(filing.document_type_full, filing.committee_name),
          rawSource: 'fec'
        }));
        return { source: 'fec', items };
      })
    );
  }

  private fetchCampaignRss(): Observable<SourceResult> {
    return this.fetchFromProxy('Campaign RSS', this.config.proxies.campaignRss).pipe(
      map((response: any) => {
        const feedItems = Array.isArray(response?.items) ? response.items : [];
        const items = feedItems.map((item: any, index: number): NewsItem => ({
          id: item.guid || item.id || `rss-${index}`,
          title: item.title ?? 'Campaign update',
          link: item.link || item.url,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          content: item.contentSnippet || item.content || '',
          source: item.source || 'Campaign RSS',
          category: item.categories?.[0],
          imageUrl: item.enclosure?.url,
          topics: this.extractTopics(item.title, item.contentSnippet),
          rawSource: 'campaign-rss'
        }));
        return { source: 'campaign-rss', items };
      })
    );
  }

  private fetchTwitter(): Observable<SourceResult> {
    return this.fetchFromProxy('Twitter', this.config.proxies.twitter).pipe(
      map((response: any) => {
        const tweets = Array.isArray(response?.data) ? response.data : [];
        const items = tweets.map((tweet: any): NewsItem => ({
          id: tweet.id,
          title: tweet.text?.slice(0, 120) ?? 'Campaign tweet',
          link: tweet.url || `https://twitter.com/i/web/status/${tweet.id}`,
          pubDate: tweet.created_at ? new Date(tweet.created_at) : new Date(),
          content: tweet.text ?? '',
          source: tweet.author_id ?? 'Campaign Twitter',
          category: 'Social',
          topics: this.extractTopics(tweet.text),
          rawSource: 'twitter'
        }));
        return { source: 'twitter', items };
      })
    );
  }

  private fetchFromProxy(sourceLabel: string, config: ProxyEndpointConfig): Observable<any> {
    const headers = config.headers instanceof HttpHeaders ? config.headers : new HttpHeaders(config.headers ?? {});
    let params: HttpParams | undefined;
    if (config.params instanceof HttpParams) {
      params = config.params;
    } else if (config.params) {
      params = new HttpParams({ fromObject: this.convertParams(config.params) });
    }

    let queryParams = params ?? new HttpParams();
    if (!queryParams.has('q')) {
      queryParams = queryParams.set('q', this.config.defaultQuery);
    }

    const request$ = this.http.get(config.url, {
      headers: headers.set('x-cache-ttl', String(this.config.cacheTtlMs)),
      params: queryParams
    });

    return request$.pipe(
      tap((response) =>
        this.telemetry.logEvent('news.ingestion.source_success', {
          source: sourceLabel,
          items: Array.isArray((response as any)?.items)
            ? (response as any).items.length
            : Array.isArray((response as any)?.articles)
            ? (response as any).articles.length
            : Array.isArray((response as any)?.data)
            ? (response as any).data.length
            : Array.isArray((response as any)?.results)
            ? (response as any).results.length
            : 0
        })
      ),
      catchError((error) => {
        const normalizedError = error instanceof Error ? error : new Error(`Failed to load ${sourceLabel}`);
        this.telemetry.logError(normalizedError, { source: sourceLabel });
        return of({});
      })
    );
  }

  private convertParams(params: Record<string, string | number | boolean>): Record<string, string> {
    return Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {});
  }

  private enrich(items: NewsItem[]): NewsItem[] {
    return items.map((item) => ({
      ...item,
      topics: Array.from(new Set([...(item.topics ?? []), ...this.extractTopics(item.title, item.content)])),
      category: item.category ?? this.deriveCategory(item)
    }));
  }

  private deriveCategory(item: NewsItem): string {
    const content = `${item.title} ${item.content}`.toLowerCase();
    if (/(poll|survey|approval)/.test(content)) {
      return 'Polling';
    }
    if (/(rally|event|appearance|speech)/.test(content)) {
      return 'Events';
    }
    if (/(fundraising|donation|finance|fec)/.test(content)) {
      return 'Fundraising';
    }
    if (/(endorsement|coalition|surrogate)/.test(content)) {
      return 'Endorsements';
    }
    return 'General';
  }

  private extractTopics(...inputs: Array<string | undefined>): string[] {
    const keywords = new Set<string>();
    const tokens = inputs
      .filter((value): value is string => typeof value === 'string')
      .flatMap((value) => value.split(/[^a-zA-Z0-9]+/))
      .map((token) => token.trim())
      .filter((token) => token.length > 3);

    tokens.forEach((token) => keywords.add(token.toLowerCase()));

    return Array.from(keywords).slice(0, 8);
  }

  private scoreItem(item: NewsItem): number {
    const now = Date.now();
    const ageHours = Math.max(1, (now - new Date(item.pubDate).getTime()) / (1000 * 60 * 60));
    const recencyScore = Math.pow(0.5, ageHours / this.config.relevance.recencyHalfLifeHours);

    const topics = (item.topics ?? []).join(' ');
    const keywordScore = Object.entries(this.config.relevance.keywordBoost).reduce((acc, [keyword, weight]) => {
      return acc + (topics.includes(keyword) ? weight : 0);
    }, 0);

    return Number((recencyScore * (1 + keywordScore)).toFixed(3));
  }
}
