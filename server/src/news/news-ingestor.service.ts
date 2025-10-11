import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import RssParser from 'rss-parser';
import { MediaType, SourceType } from '@prisma/client';
import { NewsService } from './news.service';
import { NormalizedNewsItem } from './entities/news-item.entity';

interface LicensedApiConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  query: string;
}

@Injectable()
export class NewsIngestorService {
  private readonly logger = new Logger(NewsIngestorService.name);
  private readonly rssParser = new RssParser();

  constructor(
    private readonly configService: ConfigService,
    private readonly newsService: NewsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledIngest(): Promise<void> {
    await this.ingestAllSources();
  }

  async ingestAllSources(): Promise<void> {
    const officialFeeds = this.configService.get<string[]>('ingestion.officialFeeds') ?? [];
    const licensedApis = this.configService.get<LicensedApiConfig[]>('ingestion.licensedApis') ?? [];
    const socialFeeds = this.configService.get<string[]>('ingestion.socialFeeds') ?? [];

    await Promise.all([
      ...officialFeeds.map((feedUrl) => this.ingestRssFeed(feedUrl)),
      ...licensedApis.map((api) => this.ingestLicensedApi(api)),
      ...socialFeeds.map((feed) => this.ingestSocialFeed(feed)),
    ]);
  }

  private async ingestRssFeed(feedUrl: string): Promise<void> {
    try {
      const feed = await this.rssParser.parseURL(feedUrl);
      await Promise.all(
        feed.items.map((item) =>
          this.newsService.storeNormalizedItem({
            externalId: item.guid ?? item.id ?? item.link ?? undefined,
            title: item.title ?? 'Untitled',
            summary: item.contentSnippet ?? null,
            content: item['content:encoded'] ?? item.content ?? null,
            link: item.link ?? '',
            sourceName: feed.title ?? 'Official Source',
            sourceSlug: this.slugify(feed.title ?? feedUrl),
            sourceType: SourceType.OFFICIAL,
            sourceUrl: feed.link,
            author: item.creator ?? item.author ?? null,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            topics: (item.categories ?? []).map((category) => this.slugify(category)),
            media: item.enclosure?.url
              ? [
                  {
                    url: item.enclosure.url,
                    type: this.detectMediaType(item.enclosure.type),
                    caption: item.title ?? null,
                    width: undefined,
                    height: undefined,
                  },
                ]
              : [],
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to ingest RSS feed ${feedUrl}`, error as Error);
    }
  }

  private async ingestLicensedApi(api: LicensedApiConfig): Promise<void> {
    if (!api.baseUrl || !api.apiKey) {
      this.logger.warn(`Skipping licensed API ${api.name} due to missing configuration`);
      return;
    }

    try {
      const url = new URL(api.baseUrl);
      url.searchParams.set('q', api.query);
      url.searchParams.set('language', 'en');
      url.searchParams.set('pageSize', '20');
      if (api.name === 'newsapi') {
        url.searchParams.set('apiKey', api.apiKey);
      } else {
        url.searchParams.set('api-key', api.apiKey);
      }

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (api.name !== 'newsapi') {
        headers.Authorization = `Bearer ${api.apiKey}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const articles = this.extractArticlesFromLicensedResponse(api.name, data);
      await Promise.all(articles.map((article) => this.newsService.storeNormalizedItem(article)));
    } catch (error) {
      this.logger.error(`Failed to ingest from ${api.name}`, error as Error);
    }
  }

  private async ingestSocialFeed(feed: string): Promise<void> {
    try {
      const response = await fetch(feed);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      const items = Array.isArray(payload?.items) ? payload.items : [];
      await Promise.all(
        items.map((item: any) =>
          this.newsService.storeNormalizedItem({
            externalId: item.id ?? item.url,
            title: item.title,
            summary: item.summary ?? null,
            content: item.text ?? null,
            link: item.url,
            sourceName: item.source?.name ?? 'Social Feed',
            sourceSlug: this.slugify(item.source?.name ?? 'social'),
            sourceType: SourceType.SOCIAL,
            sourceUrl: item.source?.url,
            author: item.author ?? null,
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
            topics: Array.isArray(item.topics) ? item.topics.map((topic: string) => this.slugify(topic)) : [],
            media: Array.isArray(item.media)
              ? item.media.map((asset: any) => ({
                  url: asset.url,
                  type: this.detectMediaType(asset.type),
                  caption: asset.caption,
                  width: asset.width,
                  height: asset.height,
                }))
              : [],
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to ingest social feed ${feed}`, error as Error);
    }
  }

  private extractArticlesFromLicensedResponse(name: string, data: any): NormalizedNewsItem[] {
    if (name === 'newsapi') {
      return (data.articles ?? []).map((article: any) => ({
        externalId: article.url,
        title: article.title,
        summary: article.description,
        content: article.content,
        link: article.url,
        sourceName: article.source?.name ?? 'News API',
        sourceSlug: this.slugify(article.source?.name ?? 'newsapi'),
        sourceType: SourceType.LICENSED,
        sourceUrl: article.url,
        author: article.author,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        topics: [],
        media: article.urlToImage
          ? [
              {
                url: article.urlToImage,
                type: MediaType.IMAGE,
                caption: article.title,
                width: undefined,
                height: undefined,
              },
            ]
          : [],
      }));
    }

    if (name === 'nyt') {
      return (data.response?.docs ?? []).map((doc: any) => ({
        externalId: doc._id,
        title: doc.headline?.main,
        summary: doc.abstract,
        content: doc.lead_paragraph,
        link: doc.web_url,
        sourceName: 'New York Times',
        sourceSlug: 'nytimes',
        sourceType: SourceType.LICENSED,
        sourceUrl: doc.web_url,
        author: doc.byline?.original,
        publishedAt: doc.pub_date ? new Date(doc.pub_date) : new Date(),
        topics: (doc.keywords ?? []).map((kw: any) => this.slugify(kw.value)),
        media: Array.isArray(doc.multimedia)
          ? doc.multimedia
              .filter((media: any) => Boolean(media.url))
              .map((media: any) => ({
                url: media.url.startsWith('http') ? media.url : `https://www.nytimes.com/${media.url}`,
                type: MediaType.IMAGE,
                caption: media.caption,
                width: media.width,
                height: media.height,
              }))
          : [],
      }));
    }

    return [];
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .replace(/-{2,}/g, '-');
  }

  private detectMediaType(mime?: string): MediaType {
    if (!mime) return MediaType.IMAGE;
    if (mime.startsWith('video')) return MediaType.VIDEO;
    if (mime.startsWith('audio')) return MediaType.AUDIO;
    return MediaType.IMAGE;
  }
}
