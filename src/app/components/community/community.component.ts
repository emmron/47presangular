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
      title: 'Selector Q&A: Perth Test talking points',
      description: 'Official stream recapping key selection calls before India arrive in November.',
      link: 'https://www.cricket.com.au/news',
      platform: 'official',
      moderationLevel: 'official',
    },
    {
      title: 'Club cricket coaching swap',
      description: 'Coaches trade session plans and training drills from grade and premier cricket.',
      link: 'https://www.reddit.com/r/Cricket/comments',
      platform: 'reddit',
      moderationLevel: 'community',
    },
    {
      title: 'Women & Girls participation forum',
      description: 'Share success stories and funding tips for growing female cricket programs nationwide.',
      link: 'https://www.community.cricket.com.au/clubs',
      platform: 'official',
      moderationLevel: 'official',
    },
  ];

  constructor(private tracking: TrackingService) {}

  onJoin(link: string, platform: string): void {
    this.tracking.emitEvent('community_click', { link, platform });
  }
}
