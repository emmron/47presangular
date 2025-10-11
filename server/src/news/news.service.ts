import { Injectable, Logger } from '@nestjs/common';
import fetch, { Response } from 'node-fetch';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { CacheService } from '../cache/cache.service';
import { NewsItemDto } from '../common/news-item.dto';

type SourceConfig = {
  id: string;
  rateLimit: {
    intervalMs: number;
    maxRequests: number;
  };
  fetcher: () => Promise<NewsItemDto[]>;
};

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly cacheKey = 'news:aggregated';
  private readonly cacheTtlSeconds = parseInt(
    process.env.NEWS_CACHE_TTL_SECONDS ?? '300',
    10
  );
  private readonly retryAttempts = parseInt(
    process.env.NEWS_RETRY_COUNT ?? '2',
    10
  );
  private readonly queues = new Map<string, PQueue>();
  private readonly sources: SourceConfig[];

  constructor(private readonly cache: CacheService) {
    this.sources = [
      {
        id: 'reddit',
        rateLimit: { intervalMs: 60_000, maxRequests: 50 },
        fetcher: () => this.fetchReddit()
      },
      {
        id: 'newsapi',
        rateLimit: { intervalMs: 60_000, maxRequests: 30 },
        fetcher: () => this.fetchNewsApi()
      },
      {
        id: 'nytimes',
        rateLimit: { intervalMs: 60_000, maxRequests: 10 },
        fetcher: () => this.fetchNyTimes()
      }
    ];
  }

  async getNews(forceRefresh = false): Promise<NewsItemDto[]> {
    if (!forceRefresh) {
      const cached = await this.cache.get<NewsItemDto[]>(this.cacheKey);
      if (cached?.length) {
        return cached;
      }
    }

    return this.refreshCache();
  }

  async refreshCache(): Promise<NewsItemDto[]> {
    const results = await Promise.all(
      this.sources.map((source) =>
        this.getQueue(source).add(() =>
          this.fetchWithRetry(source.fetcher, source.id)
        )
      )
    );

    const flattened = results.flat();
    const deduped = this.dedupe(flattened);
    deduped.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    await this.cache.set(this.cacheKey, deduped, this.cacheTtlSeconds);
    return deduped;
  }

  private getQueue(source: SourceConfig): PQueue {
    if (!this.queues.has(source.id)) {
      this.queues.set(
        source.id,
        new PQueue({
          concurrency: 1,
          interval: source.rateLimit.intervalMs,
          intervalCap: source.rateLimit.maxRequests,
          carryoverConcurrencyCount: true
        })
      );
    }

    return this.queues.get(source.id)!;
  }

  private async fetchWithRetry<T>(fn: () => Promise<T>, sourceId: string): Promise<T> {
    return pRetry(fn, {
      retries: this.retryAttempts,
      onFailedAttempt: (error) => {
        this.logger.warn(
          `Attempt ${error.attemptNumber} for ${sourceId} failed. ${error.retriesLeft} retries left.`
        );
      }
    });
  }

  private async fetchReddit(): Promise<NewsItemDto[]> {
    const subredditQuery = 'Cricket+CricketAustralia+BigBashLeague';
    const searchParams = new URLSearchParams({
      q: 'Australian cricket',
      restrict_sr: '1',
      sort: 'new',
      limit: '100'
    });

    const response = await this.safeFetch(
      `https://www.reddit.com/r/${subredditQuery}/search.json?${searchParams.toString()}`,
      'reddit'
    );
    const json = await response.json();

    if (!json?.data?.children) {
      throw new Error('Invalid Reddit API response format');
    }

    return json.data.children
      .filter((post: any) => post.data && !post.data.over_18)
      .map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        link: `https://reddit.com${post.data.permalink}`,
        pubDate: new Date(post.data.created_utc * 1000).toISOString(),
        content: post.data.selftext || post.data.url,
        source: post.data.subreddit_name_prefixed,
        imageUrl: this.extractRedditImage(post.data),
        category: post.data.link_flair_text ?? 'News'
      }));
  }

  private async fetchNewsApi(): Promise<NewsItemDto[]> {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      this.logger.warn('NEWSAPI_KEY is not configured; skipping NewsAPI fetch.');
      return [];
    }

    const params = new URLSearchParams({
      q: 'Australia AND cricket',
      language: 'en',
      sortBy: 'publishedAt',
      apiKey
    });

    const response = await this.safeFetch(
      `https://newsapi.org/v2/everything?${params.toString()}`,
      'newsapi'
    );
    const json = await response.json();

    if (!Array.isArray(json?.articles)) {
      throw new Error('Invalid NewsAPI response format');
    }

    return json.articles.map((article: any) => ({
      id: article.url,
      title: article.title,
      link: article.url,
      pubDate: new Date(article.publishedAt).toISOString(),
      content: article.description ?? '',
      source: article.source?.name ?? 'NewsAPI',
      imageUrl: article.urlToImage ?? undefined
    }));
  }

  private async fetchNyTimes(): Promise<NewsItemDto[]> {
    const apiKey = process.env.NYTIMES_API_KEY;
    if (!apiKey) {
      this.logger.warn('NYTIMES_API_KEY is not configured; skipping NYTimes fetch.');
      return [];
    }

    const params = new URLSearchParams({
      q: 'Australian cricket',
      sort: 'newest',
      'api-key': apiKey
    });

    const response = await this.safeFetch(
      `https://api.nytimes.com/svc/search/v2/articlesearch.json?${params.toString()}`,
      'nytimes'
    );
    const json = await response.json();

    if (!Array.isArray(json?.response?.docs)) {
      throw new Error('Invalid New York Times API response format');
    }

    return json.response.docs.map((doc: any) => ({
      id: doc._id,
      title: doc.headline?.main ?? 'Untitled',
      link: doc.web_url,
      pubDate: new Date(doc.pub_date).toISOString(),
      content: doc.abstract ?? doc.lead_paragraph ?? '',
      source: 'The New York Times',
      category: doc.section_name ?? undefined
    }));
  }

  private dedupe(items: NewsItemDto[]): NewsItemDto[] {
    const seen = new Map<string, NewsItemDto>();

    items.forEach((item) => {
      const key = item.link || item.id;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, item);
        return;
      }

      if (new Date(item.pubDate).getTime() > new Date(existing.pubDate).getTime()) {
        seen.set(key, item);
      }
    });

    return Array.from(seen.values());
  }

  private extractRedditImage(postData: any): string | undefined {
    if (
      postData.thumbnail &&
      postData.thumbnail !== 'self' &&
      postData.thumbnail !== 'default'
    ) {
      return postData.thumbnail;
    }

    const previewUrl = postData.preview?.images?.[0]?.source?.url;
    if (previewUrl) {
      return previewUrl.replace(/&amp;/g, '&');
    }

    return undefined;
  }

  private async safeFetch(url: string, source: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': '47presangular-news-aggregator/1.0'
      }
    });

    if (!response.ok) {
      const message = `${source} responded with ${response.status}`;
      throw new Error(message);
    }

    return response;
  }
}
