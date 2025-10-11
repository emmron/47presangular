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
      title: 'Selector Q&A with national panel',
      description: 'Submit your Test summer questions for George Bailey and national selectors in a moderated live chat.',
      link: 'https://community.cricket.com.au/forums/selectors-ama',
      platform: 'official',
      moderationLevel: 'official',
    },
    {
      title: 'Grade cricket tactics thread',
      description: 'Coaches swap net session drills, fitness plans, and captaincy tips from premier competitions.',
      link: 'https://www.reddit.com/r/Cricket/comments/grade_cricket_tactics',
      platform: 'reddit',
      moderationLevel: 'community',
    },
    {
      title: 'WBBL fantasy coaches corner',
      description: 'Track lineup news and share trades before the next double-header weekend.',
      link: 'https://community.cricket.com.au/forums/wbbl-fantasy',
      platform: 'official',
      moderationLevel: 'official',
    },
  ];

  constructor(private tracking: TrackingService) {}

  onJoin(link: string, platform: string): void {
    this.tracking.emitEvent('community_click', { link, platform });
  }
}
