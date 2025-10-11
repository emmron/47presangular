import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';

type FallbackDealsResponse = {
  items: RssItem[];
};

type ApiDealsResponse = {
  deals: ApiDeal[];
  fetchedAt?: string;
  source?: string;
  totalDeals?: number;
};

type ApiDeal = {
  id: string;
  title: string;
  link: string;
  author: string;
  postedAt: string;
  thumbnail?: string;
  categories: string[];
  summary: string;
  priceLabel?: string;
  priceValue?: number;
  store?: string;
  commentCount: number;
  clickCount: number;
  positiveVotes: number;
  negativeVotes: number;
  externalUrl?: string;
  score?: number;
};

type RssItem = {
  title: string;
  pubDate: string;
  link: string;
  guid?: string;
  author: string;
  thumbnail?: string;
  description?: string;
  content?: string;
  categories?: string[];
  enclosure?: {
    thumbnail?: string;
  };
};

export interface Deal {
  id: string;
  title: string;
  link: string;
  author: string;
  postedAt: Date;
  thumbnail?: string;
  categories: string[];
  summary: string;
  priceLabel?: string;
  priceValue?: number;
  store?: string;
  commentCount: number;
  clickCount: number;
  positiveVotes: number;
  negativeVotes: number;
  externalUrl?: string;
  score: number;
}

interface CategorySummary {
  name: string;
  count: number;
}

interface StoreSummary {
  name: string;
  count: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private static readonly PRIMARY_SCRAPER_URL = '/api/deals/latest';
  private static readonly FALLBACK_FEED_URL =
    'https://api.rss2json.com/v1/api.json?rss_url=https://www.ozbargain.com.au/deals/feed';

  readonly deals = signal<Deal[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedStore = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);
  readonly skeletonPlaceholders = Array.from({ length: 6 }, (_, index) => index);

  readonly categories = computed<CategorySummary[]>(() => {
    const counts = new Map<string, number>();
    for (const deal of this.deals()) {
      for (const category of deal.categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });

  readonly stores = computed<StoreSummary[]>(() => {
    const counts = new Map<string, number>();
    for (const deal of this.deals()) {
      if (!deal.store) {
        continue;
      }

      counts.set(deal.store, (counts.get(deal.store) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });

  readonly topCategoryCount = computed<number>(() => this.categories()[0]?.count ?? 0);
  readonly topCategoryName = computed<string | null>(() => this.categories()[0]?.name ?? null);
  readonly topStoreName = computed<string | null>(() => this.stores()[0]?.name ?? null);
  readonly totalCommunityVotes = computed<number>(() =>
    this.deals().reduce((sum, deal) => sum + deal.positiveVotes + deal.negativeVotes, 0)
  );
  readonly totalClickthroughs = computed<number>(() =>
    this.deals().reduce((sum, deal) => sum + deal.clickCount, 0)
  );
  readonly topScoringDeal = computed<Deal | null>(() =>
    this.findTopDeal(this.deals(), (deal) => deal.score)
  );
  readonly topDiscussedDeal = computed<Deal | null>(() =>
    this.findTopDeal(this.deals(), (deal) => deal.commentCount)
  );
  readonly topClickedDeal = computed<Deal | null>(() =>
    this.findTopDeal(this.deals(), (deal) => deal.clickCount)
  );

  readonly filteredDeals = computed<Deal[]>(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const store = this.selectedStore();

    return this.deals()
      .filter((deal) => {
        if (category && !deal.categories.includes(category)) {
          return false;
        }

        if (store && deal.store !== store) {
          return false;
        }

        if (!search) {
          return true;
        }

        const haystack = [
          deal.title,
          deal.summary,
          deal.store ?? '',
          ...deal.categories
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      })
      .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
  });

  readonly heroDeal = computed<Deal | null>(() => this.filteredDeals()[0] ?? null);
  readonly heroDealId = computed<string | null>(() => this.heroDeal()?.id ?? null);

  constructor(private readonly http: HttpClient) {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.loadFromPrimary();
  }

  private loadFromPrimary(): void {
    this.http.get<ApiDealsResponse>(AppComponent.PRIMARY_SCRAPER_URL).subscribe({
      next: (response) => {
        const payload = response.deals ?? [];
        const mapped = payload.map((deal, index) => this.hydrateApiDeal(deal, index));
        this.deals.set(mapped);
        const refreshedAt = response.fetchedAt ? this.parseDateValue(response.fetchedAt) : new Date();
        this.lastUpdated.set(refreshedAt);
        this.loading.set(false);

        if (!mapped.length) {
          this.error.set('No fresh OzBargain deals were returned. Showing the latest available list.');
        }
      },
      error: (err) => {
        console.warn('Primary OzBargain scraper failed, falling back to RSS feed.', err);
        this.loadFromFallback();
      }
    });
  }

  private loadFromFallback(): void {
    this.http.get<FallbackDealsResponse>(AppComponent.FALLBACK_FEED_URL).subscribe({
      next: (response) => {
        const mapped = response.items?.map((item, index) => this.parseDeal(item, index)) ?? [];
        this.deals.set(mapped);
        this.lastUpdated.set(new Date());
        this.loading.set(false);

        if (!mapped.length) {
          this.error.set('The OzBargain feed returned no deals. Please try again shortly.');
        }
      },
      error: (fallbackError) => {
        console.error('Fallback OzBargain RSS feed failed to load.', fallbackError);
        this.error.set('We could not load the latest OzBargain deals. Please try again shortly.');
        this.loading.set(false);
      }
    });
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
  }

  selectStore(store: string | null): void {
    this.selectedStore.set(store);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  handleSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.updateSearch(target?.value ?? '');
  }

  clearFilters(): void {
    this.selectedCategory.set(null);
    this.selectedStore.set(null);
    this.searchTerm.set('');
  }

  getRelativeTime(date: Date): string {
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (Number.isNaN(diffMinutes)) {
      return '';
    }

    if (diffMinutes < 1) {
      return 'just now';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    return date.toLocaleDateString();
  }

  private hydrateApiDeal(item: ApiDeal, index: number): Deal {
    const positiveVotes = this.coerceInteger(item.positiveVotes);
    const negativeVotes = this.coerceInteger(item.negativeVotes);
    const commentCount = this.coerceInteger(item.commentCount);
    const clickCount = this.coerceInteger(item.clickCount);
    const categories = Array.isArray(item.categories)
      ? item.categories.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean)
      : [];
    const postedAt = this.parseDateValue(item.postedAt);
    const score = Number.isFinite(item.score ?? NaN)
      ? Number(item.score)
      : positiveVotes - negativeVotes;

    return {
      id: item.id || `${index}`,
      title: item.title?.trim() ?? '',
      link: item.link,
      author: item.author?.trim() ?? 'Community Scout',
      postedAt,
      thumbnail: item.thumbnail,
      categories,
      summary: item.summary?.trim() ?? '',
      priceLabel: item.priceLabel,
      priceValue: Number.isFinite(item.priceValue ?? NaN) ? item.priceValue : undefined,
      store: item.store,
      commentCount,
      clickCount,
      positiveVotes,
      negativeVotes,
      externalUrl: item.externalUrl,
      score
    };
  }

  private findTopDeal(deals: Deal[], selector: (deal: Deal) => number): Deal | null {
    let best: Deal | null = null;
    let bestValue = -Infinity;

    for (const deal of deals) {
      const value = selector(deal);
      if (!Number.isFinite(value) || value <= 0) {
        continue;
      }

      if (!best || value > bestValue) {
        best = deal;
        bestValue = value;
      }
    }

    return best;
  }

  private parseDateValue(value: string | Date | null | undefined): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }

  private coerceInteger(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? Math.trunc(value) : 0;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private parseDeal(item: RssItem, index: number): Deal {
    const summary = this.extractSummary(item.description ?? item.content ?? '');
    const priceLabel = this.extractPrice(item.title);
    const priceValue = priceLabel ? this.parsePriceValue(priceLabel) : undefined;
    const store = this.extractStore(item.title, summary);

    return {
      id: item.guid ?? `${index}`,
      title: item.title.trim(),
      link: item.link,
      author: item.author,
      postedAt: new Date(item.pubDate),
      thumbnail: item.thumbnail ?? item.enclosure?.thumbnail,
      categories: item.categories ?? [],
      summary,
      priceLabel,
      priceValue,
      store,
      commentCount: 0,
      clickCount: 0,
      positiveVotes: 0,
      negativeVotes: 0,
      externalUrl: undefined,
      score: 0
    };
  }

  private extractSummary(html: string): string {
    const withoutTags = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return withoutTags;
  }

  private extractPrice(title: string): string | undefined {
    const priceMatch = title.match(/\$\d+[\d,.]*/);
    return priceMatch ? priceMatch[0] : undefined;
  }

  private parsePriceValue(priceLabel: string): number | undefined {
    const normalized = priceLabel.replace(/[^0-9.,]/g, '').replace(/,/g, '');
    const value = parseFloat(normalized);
    return Number.isFinite(value) ? value : undefined;
  }

  private extractStore(title: string, summary: string): string | undefined {
    const atMatch = title.match(/@\s*([^|\-\[]+)/);
    if (atMatch) {
      return atMatch[1].trim();
    }

    const fromSummary = summary.match(/@[\s]*([A-Za-z0-9 &'-]+)/);
    return fromSummary ? fromSummary[1].trim() : undefined;
  }
}
