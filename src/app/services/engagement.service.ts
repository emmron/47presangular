import { Injectable } from '@angular/core';
import { TrackingService, TrackingParams } from './tracking.service';

export interface EngagementAction {
  id: 'stream' | 'tickets';
  label: string;
  description: string;
  url: string;
  platform: 'kayo' | 'ticketek' | 'custom';
}

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly streamBaseUrl = 'https://www.kayosports.com.au/';
  private readonly ticketsBaseUrl = 'https://www.ticketek.com.au/cricket-australia';

  constructor(private tracking: TrackingService) {}

  getInlineActions(referralCode?: string): EngagementAction[] {
    return [
      this.buildAction('stream', {
        source: 'site',
        medium: 'inline_cta',
        campaign: 'cricket_engagement',
        content: 'stream_banner',
        referralCode,
      }),
      this.buildAction('tickets', {
        source: 'site',
        medium: 'inline_cta',
        campaign: 'cricket_engagement',
        content: 'tickets_banner',
        referralCode,
      }),
    ];
  }

  private buildAction(id: EngagementAction['id'], params: TrackingParams): EngagementAction {
    const isStream = id === 'stream';
    const url = this.tracking.buildTrackedUrl(
      isStream ? this.streamBaseUrl : this.ticketsBaseUrl,
      params
    );

    return {
      id,
      label: isStream ? 'Stream live' : 'Buy tickets',
      description: isStream
        ? 'Watch internationals, Big Bash, and domestic cricket live on Kayo.'
        : 'Lock in seats for internationals and Big Bash double-headers via Ticketek.',
      url,
      platform: isStream ? 'kayo' : 'ticketek',
    };
  }
}
