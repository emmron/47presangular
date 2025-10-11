export interface CampaignEvent {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  type: 'official' | 'rally' | 'community';
  location: {
    venue: string;
    city: string;
    state: string;
    coordinates: [number, number];
  };
  rsvpUrl?: string;
  checkIns?: number;
}

export interface EventFilter {
  type?: CampaignEvent['type'] | 'all';
  state?: string;
}
