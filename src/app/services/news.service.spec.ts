import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NewsService } from './news.service';
import { NewsAggregationService } from './aggregation/news-aggregation.service';
import { NewsCacheService } from './news-cache.service';
import { TelemetryService } from './telemetry.service';

class MockAggregationService {
  aggregate = jasmine.createSpy('aggregate').and.returnValue(of({ state: 'loading' } as any));
}

class MockCacheService {
  clearCache = jasmine.createSpy('clearCache').and.returnValue(Promise.resolve());
}

class MockTelemetryService {
  logEvent = jasmine.createSpy('logEvent');
  logError = jasmine.createSpy('logError');
}

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NewsService,
        { provide: NewsAggregationService, useClass: MockAggregationService },
        { provide: NewsCacheService, useClass: MockCacheService },
        { provide: TelemetryService, useClass: MockTelemetryService }
      ]
    });
    service = TestBed.inject(NewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
