import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsItemComponent } from './news-item.component';
import { NewsItem } from '../../models/news.model';

describe('NewsItemComponent', () => {
  let component: NewsItemComponent;
  let fixture: ComponentFixture<NewsItemComponent>;

  const mockItem: NewsItem = {
    id: '1',
    title: 'Test headline',
    summary: 'Summary',
    content: 'Full content',
    link: 'https://example.com',
    publishedAt: new Date('2024-05-01T12:00:00Z'),
    source: {
      name: 'Example Source',
      slug: 'example-source',
      type: 'OFFICIAL',
      url: 'https://example.com',
      author: 'Author'
    },
    topics: ['campaign'],
    mediaAssets: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NewsItemComponent);
    component = fixture.componentInstance;
    component.item = mockItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
