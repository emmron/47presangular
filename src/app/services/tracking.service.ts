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
  private readonly hubspotPortalId = 'HUBSPOT_PORTAL_ID';
  private readonly ngpVANCommitteeId = 'NGP_VAN_COMMITTEE_ID';

  buildTrackedUrl(baseUrl: string, params: TrackingParams): string {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Attach CRM references so the links can be ingested downstream.
    url.searchParams.set('hubspot_portal_id', this.hubspotPortalId);
    url.searchParams.set('ngp_van_committee_id', this.ngpVANCommitteeId);

    return url.toString();
  }

  emitEvent(eventName: string, payload: Record<string, unknown> = {}): void {
    // In a real deployment this would forward to Google Analytics, HubSpot, and NGP VAN.
    // For now we log to the console so the data pipeline can be validated in QA.
    console.debug('[tracking]', eventName, payload);
  }
}
