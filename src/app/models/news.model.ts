export type MediaType = 'article' | 'video' | 'audio' | 'gallery' | 'social';

export interface MediaCaption {
  text: string;
  url?: string;
  language?: string;
}

export interface GalleryItem {
  url: string;
  caption?: string;
export type SourceType = 'OFFICIAL' | 'LICENSED' | 'SOCIAL';
export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface NewsSource {
  name: string;
  slug: string;
  type: SourceType;
  url?: string;
  author?: string | null;
}

export interface MediaAsset {
  url: string;
  type: MediaType;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface NewsItem {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  link: string;
  publishedAt: Date;
  source: NewsSource;
  topics: string[];
  mediaAssets: MediaAsset[];
}

export interface NewsResponse {
  items: NewsItem[];
  total: number;
  page: number;
  pageSize: number;
  pubDate: Date;
  content: string;
  source: string;
  category?: string;
  imageUrl?: string;
  mediaType?: MediaType;
  mediaDurationSeconds?: number | null;
  embedUrl?: string;
  captions?: MediaCaption[];
  transcriptUrl?: string;
  transcriptText?: string;
  galleryItems?: GalleryItem[];
  topics?: string[];
  eventSlug?: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'unknown';
  momentumScore?: number;
}

export interface StorySource {
  name: string;
  url: string;
  type?: string;
  summary?: string;
}

export interface TimelineEvent {
  date: string;
  headline: string;
  description?: string;
}

export interface StoryDetail extends NewsItem {
  summary: string[];
  sources: StorySource[];
  timelineEvents: TimelineEvent[];
}

export interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  total: number;
  page: number;
  pageSize: number;
}

export interface NewsFilter {
  sources?: string[];
  topics?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  filters: NewsFilter;
  createdAt: string;
  updatedAt: string;
}

export interface DigestSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  timeOfDay: string;
  timezone?: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

export interface DigestSummary {
  id: string;
  generatedAt: string;
  summary: string;
  test?: boolean;
}

export interface DigestState {
  schedule: DigestSchedule | null;
  history: DigestSummary[];
export interface NewsQueryOptions {
  page?: number;
  pageSize?: number;
  sources?: string[];
  topics?: string[];
  search?: string;
export interface MomentumPoint {
  date: Date;
  value: number;
}

export interface TopicCallout {
  title: string;
  markdown: string;
}

export interface TopicEvent {
  slug: string;
  title: string;
  date: Date;
  description: string;
  momentum: number;
  relatedItemIds: string[];
}

export interface Topic {
  slug: string;
  title: string;
  summary: string;
  curatedCopy: string;
  callouts?: TopicCallout[];
  heroImage?: string;
  spotlightIds?: string[];
  momentumSeries: MomentumPoint[];
  events: TopicEvent[];
}

export interface TopicDataset {
  lastUpdated: Date;
  topics: Topic[];
  items: NewsItem[];
}

export interface TopicDetail {
  lastUpdated: Date;
  topic: Topic;
  items: NewsItem[];
}
