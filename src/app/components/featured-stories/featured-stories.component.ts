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
      title: 'Marsh steadies Australia in Brisbane day-night Test',
      excerpt: 'The stand-in skipper produced an unbeaten 96 to guide Australia past Pakistan under lights at the Gabba.',
      topic: 'International',
      url: 'https://www.cricket.com.au/news/mitchell-marsh-australia-pakistan-gabba-test-highlights/2024-11-08'
    },
    {
      title: 'Heat unveil fearless brand ahead of BBL|14 opener',
      excerpt: 'Coach Wade Seccombe explains the aggressive blueprint built around young quicks and power hitters.',
      topic: 'BBL',
      url: 'https://www.cricket.com.au/news/brisbane-heat-big-bash-league-season-preview-wade-seccombe/2024-11-06'
    },
    {
      title: 'WNCL pipeline delivering stars for Southern Stars',
      excerpt: 'National selectors outline how domestic standouts Phoebe Litchfield and Tess Flintoff forced their way in.',
      topic: 'Pathways',
      url: 'https://www.espncricinfo.com/story/how-australia-s-domestic-cricket-is-powering-the-women-s-team-1423897'
    }
  ];
}
