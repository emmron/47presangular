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
      title: 'Shield run machines push for Test recalls',
      excerpt: 'Twin centuries in Adelaide have selectors reconsidering the pecking order before India arrive.',
      topic: 'Sheffield Shield',
      url: 'https://www.cricket.com.au/news'
    },
    {
      title: 'WBBL stars headline Australia A tour',
      excerpt: 'A youth-heavy squad departs for New Zealand with spots in the national setup on the line.',
      topic: 'Women’s Cricket',
      url: 'https://www.cricket.com.au/news'
    },
    {
      title: 'BBL trade period sparks marquee shuffle',
      excerpt: 'Clubs are juggling retention picks and overseas slots as the contracting window opens.',
      topic: 'Big Bash',
      url: 'https://www.cricket.com.au/news'
    }
  ];
}
