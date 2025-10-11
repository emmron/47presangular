import { Injectable } from '@angular/core';
import { TrackingService, TrackingParams } from './tracking.service';

export interface EngagementAction {
  id: 'donate' | 'volunteer';
  label: string;
  description: string;
  url: string;
  platform: 'winRed' | 'actBlue' | 'custom';
}

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly donationBaseUrl = 'https://secure.winred.com/trump47/donate';
  private readonly volunteerBaseUrl = 'https://action.ngpvan.com/trump47/volunteer';

  constructor(private tracking: TrackingService) {}

  getInlineActions(referralCode?: string): EngagementAction[] {
    return [
      this.buildAction('donate', {
        source: 'site',
        medium: 'inline_cta',
        campaign: 'daily_engagement',
        content: 'donation_banner',
        referralCode,
      }),
      this.buildAction('volunteer', {
        source: 'site',
        medium: 'inline_cta',
        campaign: 'daily_engagement',
        content: 'volunteer_banner',
        referralCode,
      }),
    ];
  }

  private buildAction(id: 'donate' | 'volunteer', params: TrackingParams): EngagementAction {
    const isDonate = id === 'donate';
    const url = this.tracking.buildTrackedUrl(
      isDonate ? this.donationBaseUrl : this.volunteerBaseUrl,
      params
    );

    return {
      id,
      label: isDonate ? 'Donate Now' : 'Volunteer Today',
      description: isDonate
        ? 'Fuel the ground game with a rapid contribution via WinRed-style checkout.'
        : 'Join the field team, phone bank, or host events synced to NGP VAN.',
      url,
      platform: isDonate ? 'winRed' : 'actBlue',
    };
  }
}
