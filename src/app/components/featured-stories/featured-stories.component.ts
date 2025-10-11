import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';

type FeaturedStory = {
  title: string;
  excerpt: string;
  topic: string;
  url: string;
};

@Component({
  selector: 'app-featured-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-stories.component.html',
  styleUrls: ['./featured-stories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedStoriesComponent {
  readonly stories: FeaturedStory[] = [
    {
      title: 'Shield final locked in at the SCG',
      excerpt: 'New South Wales return to the Sheffield Shield decider with a pace-heavy attack after topping the table.',
      topic: 'Sheffield Shield',
      url: 'https://www.cricket.com.au/news/sheffield-shield-final-preview-nsw-tasmania/2024-03-18'
    },
    {
      title: 'Strikers reload for WBBL title defence',
      excerpt: 'Adelaide confirm marquee re-signings while scouting emerging quicks from the WNCL.',
      topic: 'WBBL',
      url: 'https://www.cricket.com.au/news/adelaide-strikers-wbbl-list-signings-wncl-form/2024-03-14'
    },
    {
      title: 'Aussies eye spin options for India tour',
      excerpt: 'National selectors monitor Shield spinners with subcontinent tours looming later in the year.',
      topic: 'National Teams',
      url: 'https://www.cricket.com.au/news/australia-test-tour-india-selection-watch-spin-options/2024-03-12'
    }
  ];
}
