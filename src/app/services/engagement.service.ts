import { Injectable } from '@angular/core';
import { TrackingService, TrackingParams } from './tracking.service';

export interface EngagementAction {
  id: 'tickets' | 'stream' | 'club';
  label: string;
  description: string;
  url: string;
  platform: 'ticketing' | 'streaming' | 'community';
}

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly actionConfigs = {
    tickets: {
      baseUrl: 'https://www.cricket.com.au/tickets',
      label: 'Buy Tickets',
      description: 'Reserve seats for internationals, WBBL, and BBL fixtures.',
      platform: 'ticketing' as const,
      content: 'tickets_banner'
    },
    stream: {
      baseUrl: 'https://kayosports.com.au/',
      label: 'Stream Live',
      description: 'Access live streams and minis via Kayo Sports.',
      platform: 'streaming' as const,
      content: 'stream_banner'
    },
    club: {
      baseUrl: 'https://play.cricket.com.au/clubs',
      label: 'Find a Club',
      description: 'Search for local community cricket programs.',
      platform: 'community' as const,
      content: 'club_banner'
    }
  } satisfies Record<EngagementAction['id'], {
    baseUrl: string;
    label: string;
    description: string;
    platform: EngagementAction['platform'];
    content: string;
  }>;

  constructor(private tracking: TrackingService) {}

  getInlineActions(referralCode?: string): EngagementAction[] {
    return (['tickets', 'stream', 'club'] as const).map(id =>
      this.buildAction(id, {
        source: 'site',
        medium: 'inline_cta',
        campaign: 'cricket_supporter_engagement',
        content: this.actionConfigs[id].content,
        referralCode,
      })
    );
  }

  private buildAction(id: EngagementAction['id'], params: TrackingParams): EngagementAction {
    const config = this.actionConfigs[id];
    const url = this.tracking.buildTrackedUrl(config.baseUrl, params);

    return {
      id,
      label: config.label,
      description: config.description,
      url,
      platform: config.platform,
    };
  }
}
