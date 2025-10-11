import { Injectable } from '@angular/core';

export interface TrackingParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  referralCode?: string;
  [key: string]: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly referralTag = 'AUSSIE_CRICKET_PULSE';

  buildTrackedUrl(baseUrl: string, params: TrackingParams): string {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Tag outbound links so downstream partners can attribute referrals.
    url.searchParams.set('ref', this.referralTag);

    return url.toString();
  }

  emitEvent(eventName: string, payload: Record<string, unknown> = {}): void {
    // In a real deployment this would forward to analytics and partner attribution tools.
    // For now we log to the console so signal flow can be validated in QA.
    console.debug('[tracking]', eventName, payload);
  }
}
