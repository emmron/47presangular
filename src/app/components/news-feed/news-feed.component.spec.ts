import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NewsFeedComponent } from './news-feed.component';
import { NewsStateService } from '../../services/news-state.service';
import { EngagementService } from '../../services/engagement.service';

class NewsStateServiceStub {
  state$ = of({ items: [], loading: false, error: null, lastUpdated: null });
  currentState = { items: [], loading: false, error: null, lastUpdated: null };
  fetchNews = jasmine.createSpy('fetchNews');
  updateFilters = jasmine.createSpy('updateFilters');
  resetFilters = jasmine.createSpy('resetFilters');
  setLoading = jasmine.createSpy('setLoading');
  setError = jasmine.createSpy('setError');
  getFilteredItems() {
    return [];
  }
}

class EngagementServiceStub {
  trackEvent() {
    return of(void 0);
  }

  fetchPollResults() {
    return of([]);
  }

  submitNewsletterSignup() {
    return of(void 0);
  }

  buildOgImageUrl() {
    return 'https://example.com/og.png';
  }
}

describe('NewsFeedComponent', () => {
  let component: NewsFeedComponent;
  let fixture: ComponentFixture<NewsFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsFeedComponent],
      providers: [
        { provide: NewsStateService, useClass: NewsStateServiceStub },
        { provide: EngagementService, useClass: EngagementServiceStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
