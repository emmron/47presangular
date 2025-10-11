export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  content: string;
  source: string;
  category?: string;
  imageUrl?: string;
  topics?: string[];
  eventSlug?: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'unknown';
  momentumScore?: number;
}

export interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface NewsFilter {
  source?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

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
