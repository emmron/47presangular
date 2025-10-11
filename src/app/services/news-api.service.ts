import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { GalleryItem, MediaCaption, NewsItem } from '../models/news.model';

import { NewsItem, StoryDetail, StorySource, TimelineEvent } from '../models/news.model';
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
  private readonly API_URL = '/api/news';

  constructor(private readonly http: HttpClient) {}

  getNews(forceRefresh = false): Observable<LoadingState<NewsItem[]>> {
    const params = forceRefresh ? { refresh: 'true' } : undefined;

    return toLoadingState(
      this.http
        .get<NewsItemResponse[]>(this.API_URL, { params })
        .pipe(
          retry(2),
          map(response => this.transformResponse(response)),
          catchError(error => this.handleError(error))
        )
    );
  }

  getStoryDetail(id: string): Observable<StoryDetail> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(response => this.transformStoryDetail(response)),
      catchError(error => this.handleError(error))
    );
  }

  private transformResponse(items: NewsItemResponse[]): NewsItem[] {
    return items.map(item => ({
      ...item,
      pubDate: new Date(item.pubDate)
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

  private transformRedditResponse(response: any): NewsItem[] {
    if (!response?.data?.children) {
      throw new Error('Invalid Reddit API response format');
    }

    return response.data.children
      .filter((post: any) => post.data && !post.data.over_18) // Filter out NSFW content
      .map((post: any) => {
        const mediaDetails = this.extractMediaFields(post.data);
        return {
          id: post.data.id,
          title: post.data.title,
          link: 'https://reddit.com' + post.data.permalink,
          pubDate: new Date(post.data.created_utc * 1000),
          content: post.data.selftext || post.data.url,
          source: post.data.subreddit_name_prefixed,
          category: post.data.link_flair_text || 'News',
          imageUrl: mediaDetails.imageUrl ?? this.getPostImage(post.data),
          mediaType: mediaDetails.mediaType ?? 'article',
          mediaDurationSeconds: mediaDetails.mediaDurationSeconds ?? null,
          embedUrl: mediaDetails.embedUrl,
          captions: mediaDetails.captions,
          transcriptUrl: mediaDetails.transcriptUrl,
          transcriptText: mediaDetails.transcriptText,
          galleryItems: mediaDetails.galleryItems
        } as NewsItem;
      });
      .filter((post: any) => post.data && !post.data.over_18)
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

  private extractMediaFields(postData: any): Partial<NewsItem> {
    const url = this.getPrimaryUrl(postData);
    const oembed = postData.media?.oembed;

    const galleryItems = this.extractGalleryItems(postData);
    if (galleryItems.length) {
      return {
        mediaType: 'gallery',
        galleryItems,
        imageUrl: galleryItems[0]?.url,
        captions: this.buildGalleryCaptions(galleryItems)
      };
    }

    if (postData.media?.reddit_video?.fallback_url) {
      return {
        mediaType: 'video',
        embedUrl: postData.media.reddit_video.fallback_url.replace(/&amp;/g, '&'),
        mediaDurationSeconds: postData.media.reddit_video.duration ?? null,
        imageUrl: this.getPostImage(postData),
        captions: this.createMediaCaption('Enable captions in the Reddit player', url)
      };
    }

    if (this.isYouTubeUrl(url) || this.isYouTubeProvider(oembed)) {
      const videoId = this.extractYouTubeId(url || oembed?.url || '');
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return {
          mediaType: 'video',
          embedUrl,
          mediaDurationSeconds: this.extractDurationSeconds(postData, oembed),
          imageUrl: oembed?.thumbnail_url?.replace(/&amp;/g, '&') ?? this.getPostImage(postData),
          captions: [
            {
              text: 'Watch on YouTube with closed captions',
              url: `https://www.youtube.com/watch?v=${videoId}&cc_load_policy=1`,
              language: oembed?.language || 'en'
            }
          ]
        };
      }
    }

    if (this.isTwitterUrl(url) || this.isTwitterProvider(oembed)) {
      const targetUrl = url || oembed?.url;
      if (targetUrl) {
        return {
          mediaType: 'social',
          embedUrl: `https://twitframe.com/show?url=${encodeURIComponent(targetUrl)}`,
          captions: this.createMediaCaption('Open original post on X (formerly Twitter)', targetUrl)
        };
      }
    }

    if (this.isAudioUrl(url) || oembed?.type === 'audio') {
      return {
        mediaType: 'audio',
        embedUrl: url || oembed?.url,
        mediaDurationSeconds: this.extractDurationSeconds(postData, oembed),
        imageUrl: oembed?.thumbnail_url?.replace(/&amp;/g, '&') ?? this.getPostImage(postData),
        captions: postData.selftext
          ? [{ text: 'Read the episode summary below', language: 'en' }]
          : undefined,
        transcriptText: postData.selftext || undefined
      };
    }

    return {};
  }

  private getPrimaryUrl(postData: any): string {
    return (postData.url_overridden_by_dest || postData.url || '').toString();
  }

  private extractGalleryItems(postData: any): GalleryItem[] {
    if (!postData?.is_gallery || !postData?.media_metadata) {
      return [];
    }

    const galleryData = postData.gallery_data?.items || [];
    return galleryData
      .map((item: any) => {
        const media = postData.media_metadata[item.media_id];
        if (!media) {
          return undefined;
        }
        const source = media.s?.u || media.s?.gif || media.s?.mp4;
        if (!source) {
          return undefined;
        }
        return {
          url: source.replace(/&amp;/g, '&'),
          caption: item.caption || media.caption
        } as GalleryItem;
      })
      .filter((item: GalleryItem | undefined): item is GalleryItem => Boolean(item));
  }

  private buildGalleryCaptions(galleryItems: GalleryItem[]): MediaCaption[] | undefined {
    const captions = galleryItems
      .filter(item => Boolean(item.caption))
      .map(item => ({
        text: item.caption as string
      }));

    return captions.length ? captions : undefined;
  }

  private createMediaCaption(text: string, url?: string): MediaCaption[] {
    return [
      {
        text,
        url
      }
    ];
  }

  private isYouTubeUrl(url: string): boolean {
    return /youtu\.be|youtube\.com/i.test(url);
  }

  private isYouTubeProvider(oembed: any): boolean {
    return Boolean(oembed?.provider_name && /youtube/i.test(oembed.provider_name));
  }

  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /youtu\.be\/([\w-]{11})/, // short url
      /youtube\.com\/(?:watch\?v=|embed\/|v\/)([\w-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return null;
  }

  private isTwitterUrl(url: string): boolean {
    return /twitter\.com|x\.com/i.test(url);
  }

  private isTwitterProvider(oembed: any): boolean {
    return Boolean(oembed?.provider_name && /(twitter|x)/i.test(oembed.provider_name));
  }

  private isAudioUrl(url: string): boolean {
    return /\.(mp3|m4a|aac|wav|ogg|flac)(\?|$)/i.test(url);
  }

  private extractDurationSeconds(postData: any, oembed?: any): number | null {
    const potentialDurations = [
      postData.media?.reddit_video?.duration,
      oembed?.duration,
      oembed?.length
    ];

    for (const duration of potentialDurations) {
      if (typeof duration === 'number') {
        return duration;
      }
      if (typeof duration === 'string') {
        const parsed = this.parseDurationString(duration);
        if (parsed !== null) {
          return parsed;
        }
      }
    }
    return null;
  }

  private parseDurationString(value: string): number | null {
    const timeParts = value.split(':').map(part => Number(part));
    if (timeParts.some(isNaN)) {
      return null;
    }

    let seconds = 0;
    for (const part of timeParts) {
      seconds = seconds * 60 + part;
    }
    return seconds;
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
