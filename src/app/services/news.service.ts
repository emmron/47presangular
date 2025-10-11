import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NewsItem } from '../models/news.model';
import { LoadingState } from '../models/loading-state.model';
import { NewsAggregationService } from './aggregation/news-aggregation.service';
import { NewsCacheService } from './news-cache.service';
import { TelemetryService } from './telemetry.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(
    private readonly aggregationService: NewsAggregationService,
    private readonly cacheService: NewsCacheService,
    private readonly telemetry: TelemetryService
  ) {}

  fetchNews(): Observable<LoadingState<NewsItem[]>> {
    return this.aggregationService.aggregate().pipe(
      tap((state) => {
        if (state.state === 'loaded') {
          this.telemetry.logEvent('news.service.loaded', {
            items: state.data.length,
            topRelevance: state.data[0]?.relevanceScore ?? null
          });
        }
        if (state.state === 'error') {
          this.telemetry.logError(state.error, { scope: 'news-service' });
        }
      })
    );
  }

  async clearCache(): Promise<void> {
    await this.cacheService.clearCache();
  }
}
