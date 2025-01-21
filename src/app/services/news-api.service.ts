import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { NewsItem } from '../models/news.model';
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
