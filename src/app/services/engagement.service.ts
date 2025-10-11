import { Injectable } from '@angular/core';
import { TrackingService, TrackingParams } from './tracking.service';

export interface EngagementAction {
  id: 'tickets' | 'club';
  label: string;
  description: string;
  url: string;
  platform: 'cricket.com.au' | 'playcricket';
}

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly ticketBaseUrl = 'https://www.cricket.com.au/tickets';
  private readonly clubFinderUrl = 'https://www.playcricket.com.au/club-finder';

  constructor(private tracking: TrackingService) {}

  getInlineActions(referralCode?: string): EngagementAction[] {
    return [
      this.buildAction('tickets', {
        source: 'site',
        medium: 'inline_cta',
        initiative: 'aussie_cricket_pulse',
        content: 'ticket_banner',
        referralCode,
      }),
      this.buildAction('club', {
        source: 'site',
        medium: 'inline_cta',
        initiative: 'aussie_cricket_pulse',
        content: 'club_banner',
        referralCode,
      }),
    ];
  }

  private buildAction(id: EngagementAction['id'], params: TrackingParams): EngagementAction {
    const isTicket = id === 'tickets';
    const url = this.tracking.buildTrackedUrl(
      isTicket ? this.ticketBaseUrl : this.clubFinderUrl,
      params
    );

    return {
      id,
      label: isTicket ? 'Buy match tickets' : 'Find a club',
      description: isTicket
        ? 'Reserve seats for internationals, WBBL, and Big Bash fixtures.'
        : 'Connect with junior and senior teams across Australia.',
      url,
      platform: isTicket ? 'cricket.com.au' : 'playcricket',
    };
  }
}
