import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NewsItem } from '../models/news.model';
import { NewsApiService } from './news-api.service';
import { NewsStateService } from './news-state.service';
import { LoadingState } from '../models/loading-state.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(
    private newsApiService: NewsApiService,
    private stateService: NewsStateService
  ) {}

  fetchNews(forceRefresh = false): Observable<NewsItem[]> {
    return this.newsApiService.getNews(forceRefresh).pipe(
      map((state) => {
        this.handleStateTransition(state);
        return state;
      }),
      filter(
        (state): state is LoadingState<NewsItem[]> & { state: 'loaded' } =>
          state.state === 'loaded'
      ),
      map((state) => state.data)
    );
  }

  private handleStateTransition(loadingState: LoadingState<NewsItem[]>): void {
    switch (loadingState.state) {
      case 'loading':
        this.stateService.setLoading(true);
        this.stateService.setError(null);
        break;
      case 'loaded':
        this.stateService.setItems(loadingState.data);
        this.stateService.setLoading(false);
        break;
      case 'error':
        this.stateService.setError(loadingState.error.message);
        this.stateService.setLoading(false);
        break;
    }
  }
}
