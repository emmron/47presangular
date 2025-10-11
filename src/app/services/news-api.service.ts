import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { GalleryItem, MediaCaption, NewsItem } from '../models/news.model';
import { LoadingState, toLoadingState } from '../models/loading-state.model';

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {
  private readonly SUBREDDITS = [
    'politics',
    'news',
    'worldnews'
  ];

  constructor(private http: HttpClient) {}

  getNews(): Observable<LoadingState<NewsItem[]>> {
    // Fetch from multiple subreddits and combine results
    const requests = this.SUBREDDITS.map(subreddit =>
      this.http.get<any>(`https://www.reddit.com/r/${subreddit}/search.json?q=trump+2024+campaign&restrict_sr=1&sort=new&limit=25`)
    );

    return toLoadingState(
      this.http.get<any>('https://www.reddit.com/r/politics+news+worldnews/search.json?q=trump+2024+campaign&restrict_sr=1&sort=new&limit=100').pipe(
        map(response => this.transformRedditResponse(response)),
        retry(3),
        catchError(this.handleError)
      )
    );
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
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
          errorMessage = 'Reddit service is temporarily unavailable';
          break;
        case 503:
          errorMessage = 'Reddit is under heavy load. Please try again later';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('Reddit API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
