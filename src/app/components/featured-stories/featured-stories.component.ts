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
      title: 'Aussies lock in New Zealand tour squad',
      excerpt: 'Selectors reward Shield form as Lance Morris and Aaron Hardie headline the travelling party.',
      topic: 'International',
      url: 'https://www.cricket.com.au/news/australia-squad-new-zealand-tour/'
    },
    {
      title: 'WNCL final set for North Sydney Oval',
      excerpt: 'NSW Breakers and Tasmania Tigers prepare for a rematch with star-studded line-ups.',
      topic: 'Domestic',
      url: 'https://www.cricket.com.au/news/wncl-final-preview/'
    },
    {
      title: 'BBL clubs chase marquee deals',
      excerpt: 'Franchises eye overseas signatures as contracting window opens ahead of summer.',
      topic: 'Big Bash',
      url: 'https://www.cricket.com.au/news/bbl-signings-window/'
    }
  ];
}
