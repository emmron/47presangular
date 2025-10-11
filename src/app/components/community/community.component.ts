import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';

interface CommunityThread {
  title: string;
  description: string;
  link: string;
  platform: 'reddit' | 'official';
  moderationLevel: 'community' | 'official';
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CommunityComponent {
  readonly featuredThreads: CommunityThread[] = [
    {
      title: 'Selector chat: Who tours Sri Lanka?',
      description: 'National selectors join to field questions on spin depth and allrounder balance.',
      link: 'https://www.cricket.com.au/news/australia-fan-forum-selector-chat',
      platform: 'official',
      moderationLevel: 'official',
    },
    {
      title: 'Grade cricket hot streaks',
      description: 'Fans share clips and stats from Premier Cricket across the states each weekend.',
      link: 'https://www.reddit.com/r/Cricket/comments/premier_cricket_wrap/',
      platform: 'reddit',
      moderationLevel: 'community',
    },
    {
      title: 'BBL fan tactics board',
      description: 'Debate batting orders and power surge strategies before the next double-header.',
      link: 'https://www.bigbash.com.au/fans/forum',
      platform: 'official',
      moderationLevel: 'official',
    },
  ];

  constructor(private tracking: TrackingService) {}

  onJoin(link: string, platform: string): void {
    this.tracking.emitEvent('community_click', { link, platform });
  }
}
