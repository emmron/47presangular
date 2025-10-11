import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NewsFeedComponent } from './news-feed.component';
import { NewsStateService } from '../../services/news-state.service';
import { AuthService } from '../../auth/auth.service';

const mockNewsStateService = {
  state$: of({ items: [], loading: false, error: null, lastUpdated: null }),
  savedPresets$: of([]),
  digestSchedule$: of({ schedule: null, history: [] }),
  fetchNews: jasmine.createSpy('fetchNews'),
  updateFilters: jasmine.createSpy('updateFilters'),
  resetFilters: jasmine.createSpy('resetFilters'),
  getFilteredItems: jasmine.createSpy('getFilteredItems').and.returnValue([]),
  saveCurrentFilters: jasmine.createSpy('saveCurrentFilters').and.returnValue(of({
    id: 'preset-1',
    name: 'Preset',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    filters: {}
  })),
  deleteFilterPreset: jasmine.createSpy('deleteFilterPreset').and.returnValue(of(void 0)),
  applyPreset: jasmine.createSpy('applyPreset')
};

const mockAuthService = {
  user$: of({
    id: 'user-1',
    email: 'user@example.com',
    displayName: 'Test User',
    provider: 'email',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
};

describe('NewsFeedComponent', () => {
  let component: NewsFeedComponent;
  let fixture: ComponentFixture<NewsFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsFeedComponent],
      providers: [
        { provide: NewsStateService, useValue: mockNewsStateService },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([])
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
