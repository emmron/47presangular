import { NewsFilter } from './news.model';

export type DigestFrequency = 'daily' | 'weekly' | 'monthly';

export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: string;
  isGuest?: boolean;
}

export interface NotificationPreferences {
  emailDigest: boolean;
  pushNotifications: boolean;
  digestFrequency: DigestFrequency;
  lastDigestSentAt?: string | null;
  quietHours?: { start: string; end: string } | null;
}

export interface SavedNewsFilter {
  id: string;
  name: string;
  filters: NewsFilter;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedArticleSummary {
  id: string;
  articleId: string;
  savedAt: string;
  item: {
    title: string;
    link: string;
    source: string;
    pubDate: string;
    category?: string;
    imageUrl?: string;
    excerpt?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  followTopics: string[];
  notificationPreferences: NotificationPreferences;
  activeFilterId?: string | null;
  activeFilters?: NewsFilter | null;
  lastSyncedAt?: string | null;
}

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  type: 'digest' | 'breaking' | 'follow-topic' | 'saved-search' | 'system';
  createdAt: string;
  readAt?: string | null;
  link?: string;
  metadata?: Record<string, unknown> | null;
}

export interface IngestionNotificationPayload {
  topic: string;
  articleId: string;
  headline: string;
  summary: string;
  link: string;
  publishedAt: string;
  subscribers: string[];
}
