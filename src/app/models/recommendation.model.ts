import { NewsItem } from './news.model';

export interface RecommendationCohort {
  id: string;
  label: string;
  description: string;
}

export interface RecommendationApiItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category?: string;
  imageUrl?: string;
  publishedAt: string;
  recommendationScore?: number;
  breakdown?: {
    contentScore?: number;
    collaborativeScore?: number;
    popularityBoost?: number;
  };
}

export interface RecommendationApiResponse {
  requestedAt: string;
  userId: string | null;
  strategy: 'personalized' | 'fallback';
  cohort?: RecommendationCohort;
  items: RecommendationApiItem[];
}

export interface RecommendationFeed {
  requestedAt: string;
  userId: string | null;
  strategy: 'personalized' | 'fallback';
  cohort?: RecommendationCohort;
  items: NewsItem[];
}
