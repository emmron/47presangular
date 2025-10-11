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
  topics?: string[];
  savedFilterId?: string | null;
  onlyFollowedTopics?: boolean;
}

export interface SavedFilterSnapshot {
  id: string;
  name: string;
  filters: NewsFilter;
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
}
