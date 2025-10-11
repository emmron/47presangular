import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';

interface CommunityThread {
  title: string;
  description: string;
  link: string;
  platform: 'reddit' | 'official';
  moderationLevel: 'community' | 'editorial';
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
      title: 'Selection chat: Who opens in Perth?',
      description: 'Fans debate whether Harris or Renshaw should partner Khawaja in the first Test against India.',
      link: 'https://www.reddit.com/r/Cricket/comments/selection_chat_first_test_openers/',
      platform: 'reddit',
      moderationLevel: 'community',
    },
    {
      title: 'Coach forum: WBBL tactics live session',
      description: 'Brisbane Heat staff share powerplay plans and invite junior coaches to ask questions.',
      link: 'https://www.cricket.com.au/news/wbbl-coaching-forum-registration/2024-11-05',
      platform: 'official',
      moderationLevel: 'editorial',
    },
    {
      title: 'Grassroots grants AMA',
      description: 'Cricket Australia participation managers outline funding options for clubs upgrading facilities.',
      link: 'https://www.playcricket.com.au/community/news/club-grants-ama',
      platform: 'official',
      moderationLevel: 'editorial',
    },
  ];

  constructor(private tracking: TrackingService) {}

  onJoin(link: string, platform: string): void {
    this.tracking.emitEvent('community_click', { link, platform });
  }
}
