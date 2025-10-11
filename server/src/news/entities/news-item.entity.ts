import { MediaAsset, NewsItem, SourceType } from '@prisma/client';

export type NewsItemWithRelations = NewsItem & {
  mediaAssets: MediaAsset[];
  topics: { topic: { slug: string } }[];
};

export interface NormalizedNewsItem {
  externalId?: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  link: string;
  sourceName: string;
  sourceSlug: string;
  sourceType: SourceType;
  sourceUrl?: string | null;
  author?: string | null;
  publishedAt: Date;
  topics?: string[];
  media?: Array<Pick<MediaAsset, 'url' | 'type' | 'caption' | 'width' | 'height'>>;
}
