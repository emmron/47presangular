export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  content: string;
  source: string;
  category?: string;
  imageUrl?: string;
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
}

export interface NewsFilter {
  source?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}
