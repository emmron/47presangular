export type MediaType = 'article' | 'video' | 'audio' | 'gallery' | 'social';

export interface MediaCaption {
  text: string;
  url?: string;
  language?: string;
}

export interface GalleryItem {
  url: string;
  caption?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
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
