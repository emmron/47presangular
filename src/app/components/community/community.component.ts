import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';

interface CommunityThread {
  title: string;
  description: string;
  link: string;
  platform: 'reddit' | 'official';
  moderationLevel: 'community' | 'campaign';
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
      title: 'Strategy AMA with campaign leadership',
      description: 'Bring your questions for the digital, field, and finance directors. Moderated by the official campaign team.',
      link: 'https://community.trump47.com/threads/strategy-ama',
      platform: 'official',
      moderationLevel: 'campaign',
    },
    {
      title: 'Grassroots organizing toolkit',
      description: 'Volunteer leaders share the scripts and materials that are working in their counties.',
      link: 'https://www.reddit.com/r/Conservative/comments/toolkit',
      platform: 'reddit',
      moderationLevel: 'community',
    },
    {
      title: 'Digital rapid response room',
      description: 'Coordinate social media pushes in real time. Official moderators surface priority narratives.',
      link: 'https://community.trump47.com/threads/digital-war-room',
      platform: 'official',
      moderationLevel: 'campaign',
    },
  ];

  constructor(private tracking: TrackingService) {}

  onJoin(link: string, platform: string): void {
    this.tracking.emitEvent('community_click', { link, platform });
  }
}
