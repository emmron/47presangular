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

export interface NewsQueryOptions {
  page?: number;
  pageSize?: number;
  sources?: string[];
  topics?: string[];
  search?: string;
}
