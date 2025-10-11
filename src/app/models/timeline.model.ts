export type TimelineCategory = 'news' | 'release' | 'milestone';

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  category: TimelineCategory;
  link?: string;
}
