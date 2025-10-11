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
  relevanceScore?: number;
  rawSource?: string;
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
