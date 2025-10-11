import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsItemComponent } from './news-item.component';
import { EngagementService } from '../../services/engagement.service';

class EngagementServiceStub {
  buildOgImageUrl() {
    return 'https://example.com/og.png';
  }
}

describe('NewsItemComponent', () => {
  let component: NewsItemComponent;
  let fixture: ComponentFixture<NewsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsItemComponent],
      providers: [
        { provide: EngagementService, useClass: EngagementServiceStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
