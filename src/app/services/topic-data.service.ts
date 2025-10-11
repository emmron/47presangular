import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import {
  NewsItem,
  Topic,
  TopicDataset,
  TopicDetail,
  TopicEvent,
  MomentumPoint
} from '../models/news.model';

interface RawNewsItem extends Omit<NewsItem, 'pubDate'> {
  pubDate: string;
}

interface RawMomentumPoint extends Omit<MomentumPoint, 'date'> {
  date: string;
}

interface RawTopicEvent extends Omit<TopicEvent, 'date'> {
  date: string;
}

interface RawTopic extends Omit<Topic, 'events' | 'momentumSeries'> {
  events: RawTopicEvent[];
  momentumSeries: RawMomentumPoint[];
}

interface RawTopicDataset {
  lastUpdated: string;
  topics: RawTopic[];
  items: RawNewsItem[];
}

@Injectable({
  providedIn: 'root'
})
export class TopicDataService {
  private readonly apiUrl = '/api/news';
  private readonly fallbackUrl = 'assets/data/news-topics.json';
  private dataset$?: Observable<TopicDataset>;

  constructor(private http: HttpClient) {}

  getDataset(): Observable<TopicDataset> {
    if (!this.dataset$) {
      this.dataset$ = this.fetchDataset().pipe(shareReplay(1));
    }
    return this.dataset$;
  }

  getTopicDetail(slug: string): Observable<TopicDetail> {
    return this.getDataset().pipe(
      map(dataset => {
        const topic = dataset.topics.find(t => t.slug === slug);
        if (!topic) {
          throw new Error(`Topic '${slug}' not found`);
        }

        const items = dataset.items.filter(item => item.topics?.includes(slug));
        return {
          lastUpdated: dataset.lastUpdated,
          topic,
          items
        };
      })
    );
  }

  private fetchDataset(): Observable<TopicDataset> {
    return this.http.get<RawTopicDataset>(this.apiUrl).pipe(
      map(raw => this.transformDataset(raw)),
      catchError(() =>
        this.http
          .get<RawTopicDataset>(this.fallbackUrl)
          .pipe(map(raw => this.transformDataset(raw)))
      )
    );
  }

  private transformDataset(raw: RawTopicDataset): TopicDataset {
    return {
      lastUpdated: new Date(raw.lastUpdated),
      topics: raw.topics.map(topic => this.transformTopic(topic)),
      items: raw.items.map(item => this.transformNewsItem(item))
    };
  }

  private transformTopic(raw: RawTopic): Topic {
    return {
      ...raw,
      momentumSeries: raw.momentumSeries.map(point => this.transformMomentum(point)),
      events: raw.events.map(event => this.transformEvent(event))
    };
  }

  private transformEvent(raw: RawTopicEvent): TopicEvent {
    return {
      ...raw,
      date: new Date(raw.date)
    };
  }

  private transformMomentum(raw: RawMomentumPoint): MomentumPoint {
    return {
      ...raw,
      date: new Date(raw.date)
    };
  }

  private transformNewsItem(raw: RawNewsItem): NewsItem {
    return {
      ...raw,
      pubDate: new Date(raw.pubDate)
    };
  }
}
