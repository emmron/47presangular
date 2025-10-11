export interface MediaImageSource {
  width: number;
  url: string;
}

export interface MediaImage {
  alt: string;
  fallback: string;
  sources?: MediaImageSource[];
}

export interface LiveStreamInfo {
  id: string;
  title: string;
  description?: string;
  streamUrl: string;
  isLive: boolean;
  startedAt?: string;
  thumbnail?: MediaImage;
}

export interface AdSpotlightInfo {
  id: string;
  advertiser: string;
  headline: string;
  copy?: string;
  callToAction: string;
  targetUrl: string;
  image: MediaImage;
  metrics?: {
    impressions?: number;
    clicks?: number;
  };
}

export interface EventLocation {
  id: string;
  title: string;
  description?: string;
  venue?: string;
  city?: string;
  state?: string;
  startDate: string;
  endDate?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  heroImage?: MediaImage;
}
