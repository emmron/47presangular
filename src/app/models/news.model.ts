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
}
