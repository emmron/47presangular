import { Injectable } from '@angular/core';

export interface TrackingParams {
  source: string;
  medium: string;
  initiative: string;
  content?: string;
  referralCode?: string;
  [key: string]: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly analyticsPartnerId = 'SPORTS_HUB_ID';
  private readonly participationPartnerId = 'PLAYCRICKET_PARTNER_ID';

  buildTrackedUrl(baseUrl: string, params: TrackingParams): string {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Attach analytics references used by partner dashboards.
    url.searchParams.set('analytics_partner_id', this.analyticsPartnerId);
    url.searchParams.set('participation_partner_id', this.participationPartnerId);

    return url.toString();
  }

  emitEvent(eventName: string, payload: Record<string, unknown> = {}): void {
    // In a real deployment this would forward to GA4, Adobe Analytics, or partner data pipelines.
    // For now we log to the console so the instrumentation can be validated in QA environments.
    console.debug('[tracking]', eventName, payload);
  }
}
