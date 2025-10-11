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
      title: 'Ground Game Intensifies in Swing States',
      excerpt: 'Organizers ramp up door-to-door outreach in Pennsylvania and Arizona as polling margins tighten.',
      topic: 'Field Operations',
      url: 'https://www.donaldjtrump.com/news/'
    },
    {
      title: 'Fundraising Push Sets New Monthly Record',
      excerpt: 'Digital campaigns and grassroots donations combine for a historic funding surge across small-dollar donors.',
      topic: 'Fundraising',
      url: 'https://www.donaldjtrump.com/news/'
    },
    {
      title: 'Policy Rollout Focuses on Energy Independence',
      excerpt: 'The campaign outlines a renewed strategy for domestic energy production aimed at lowering costs for families.',
      topic: 'Policy',
      url: 'https://www.donaldjtrump.com/news/'
    }
  ];
}
