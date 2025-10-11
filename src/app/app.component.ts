import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type StreamId = 'featured' | 'latest' | 'trending';
type StockType = 'local' | 'overseas';
type DealStatus = 'hot' | 'new' | 'lastChance';
type DealCategory = 'gear' | 'tickets' | 'streaming' | 'training' | 'community';

interface Deal {
  id: number;
  title: string;
  description: string;
  store: string;
  link: string;
  postedBy: string;
  postedAt: Date;
  expiresAt?: Date;
  price: number | null;
  originalPrice?: number;
  currency: 'AUD';
  shipping?: string;
  location?: string;
  voteCount: number;
  commentCount: number;
  tags: string[];
  category: DealCategory;
  stockType: StockType;
  status: DealStatus;
  heat: number;
}

interface CategorySummary {
  slug: string;
  label: string;
  description: string;
  icon: string;
  count: number;
}

interface StreamOption {
  id: StreamId;
  label: string;
  description: string;
}

interface MetricSummary {
  label: string;
  value: string;
  meta: string;
}

interface StoreSummary {
  name: string;
  deals: number;
  votes: number;
  score: string;
}

interface LeaderSummary {
  name: string;
  deals: number;
  votes: number;
}

interface TagSummary {
  tag: string;
  mentions: number;
}

interface ActiveFilter {
  key: 'category' | 'local-stock' | 'tickets' | 'search';
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly streams: StreamOption[] = [
    { id: 'featured', label: 'Hot right now', description: 'Ranked by community heat' },
    { id: 'latest', label: 'Fresh catches', description: 'Newest finds from the last day' },
    { id: 'trending', label: 'Comment surge', description: 'Most discussed this week' }
  ];

  readonly dealStatusMeta: Record<DealStatus, { label: string; emoji: string }> = {
    hot: { label: 'Hot', emoji: '🔥' },
    new: { label: 'New', emoji: '✨' },
    lastChance: { label: 'Last call', emoji: '⏰' }
  };

  private readonly seededDeals: Deal[] = [
    {
      id: 1,
      title: 'Kookaburra Ghost Pro 4.0 Full Kit + Free Grips',
      description:
        'Complete senior kit with bat, pads, gloves and duffle. Local warranty honoured. Bonus set of grips for the first 150 orders.',
      store: 'Kingsgrove Sports',
      link: 'https://ozcrickets.example/deal/kookaburra-ghost-kit',
      postedBy: 'coverdrive',
      postedAt: new Date(Date.now() - 1000 * 60 * 42),
      price: 389,
      originalPrice: 529,
      currency: 'AUD',
      shipping: 'Free metro shipping',
      location: 'NSW',
      voteCount: 186,
      commentCount: 74,
      tags: ['gear', 'senior', 'limited'],
      category: 'gear',
      stockType: 'local',
      status: 'hot',
      heat: 94
    },
    {
      id: 2,
      title: 'Border-Gavaskar Day 3 Tickets (Brisbane) Member Presale',
      description:
        'Cricket Australia Insider presale now live. Southern Stand and Premium Reserve still wide open. Digital delivery within minutes.',
      store: 'Ticketek',
      link: 'https://ozcrickets.example/deal/border-gavaskar-day3',
      postedBy: 'sillymid',
      postedAt: new Date(Date.now() - 1000 * 60 * 90),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      price: 145,
      currency: 'AUD',
      shipping: 'Mobile tickets',
      location: 'QLD',
      voteCount: 132,
      commentCount: 58,
      tags: ['tickets', 'test cricket', 'presale'],
      category: 'tickets',
      stockType: 'local',
      status: 'hot',
      heat: 88
    },
    {
      id: 3,
      title: 'WillowPro Throwdown Net Bundle + Ball Feeder',
      description:
        'Pop-up lane with weighted base, feeder, and 18 training balls. Excellent for backyard sessions. Club accounts stack for extra 10% off.',
      store: 'Aussie Cricket Direct',
      link: 'https://ozcrickets.example/deal/willowpro-net',
      postedBy: 'deepfineleg',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      price: 279,
      originalPrice: 399,
      currency: 'AUD',
      shipping: '$15 nationwide',
      voteCount: 96,
      commentCount: 31,
      tags: ['training', 'club discount', 'bundle'],
      category: 'training',
      stockType: 'local',
      status: 'new',
      heat: 72
    },
    {
      id: 4,
      title: 'Optus Sport 3-Month Cricket Add-on via SubHub',
      description:
        'Stackable SubHub promo: subscribe to Optus Sport cricket add-on and get 3 months at half price plus a month of Kayo freebies.',
      store: 'Optus SubHub',
      link: 'https://ozcrickets.example/deal/optus-subhub-kayo',
      postedBy: 'thirdman',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      price: 24,
      originalPrice: 60,
      currency: 'AUD',
      shipping: 'Digital subscription',
      voteCount: 148,
      commentCount: 112,
      tags: ['streaming', 'subscription', 'kayo'],
      category: 'streaming',
      stockType: 'overseas',
      status: 'hot',
      heat: 90
    },
    {
      id: 5,
      title: 'Gray-Nicolls Supernova Players Edition - Factory Seconds',
      description:
        'Factory seconds with minor cosmetic blemishes. Hand-picked 2lb9oz bats in short handle. Comes with fibre tech sleeve installed.',
      store: 'Greg Chappell Cricket Centre',
      link: 'https://ozcrickets.example/deal/supernova-seconds',
      postedBy: 'legslip',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5),
      price: 499,
      originalPrice: 799,
      currency: 'AUD',
      shipping: '$12 express',
      location: 'VIC',
      voteCount: 211,
      commentCount: 89,
      tags: ['gear', 'players edition', 'factory seconds'],
      category: 'gear',
      stockType: 'local',
      status: 'lastChance',
      heat: 84
    },
    {
      id: 6,
      title: 'Community Scorers Toolkit (MyCricket Premium + Zebra Printer)',
      description:
        'Volunteer pack covering premium scoring, Zebra ZD4 printer, and 8,000 label reels. Reimbursable under NSO grants.',
      store: 'Cricket Australia Shop',
      link: 'https://ozcrickets.example/deal/scorers-toolkit',
      postedBy: 'scoreboxhero',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      price: 0,
      originalPrice: 349,
      currency: 'AUD',
      shipping: 'Free pickup or $9 courier',
      voteCount: 167,
      commentCount: 42,
      tags: ['community', 'grant', 'freebie'],
      category: 'community',
      stockType: 'local',
      status: 'hot',
      heat: 86
    }
  ];

  readonly deals = signal<Deal[]>(this.seededDeals);
  readonly selectedStream = signal<StreamId>('featured');
  readonly selectedCategory = signal<string>('all');
  readonly searchTerm = signal('');
  readonly onlyLocalStock = signal(false);
  readonly includeTickets = signal(true);

  readonly categories = computed<CategorySummary[]>(() => {
    const deals = this.deals();
    const definitions: Array<Omit<CategorySummary, 'count'>> = [
      {
        slug: 'gear',
        label: 'Gear & equipment',
        description: 'Bats, pads, kits and protection',
        icon: '🏏'
      },
      {
        slug: 'training',
        label: 'Training tech',
        description: 'Nets, bowling machines, analytics',
        icon: '🎯'
      },
      {
        slug: 'tickets',
        label: 'Tickets & travel',
        description: 'Match access and tours',
        icon: '🎟️'
      },
      {
        slug: 'streaming',
        label: 'Streaming & media',
        description: 'Broadcast bundles and add-ons',
        icon: '📺'
      },
      {
        slug: 'community',
        label: 'Community support',
        description: 'Club grants and volunteer perks',
        icon: '🤝'
      }
    ];

    const totals = definitions.map((definition) => ({
      ...definition,
      count: deals.filter((deal) => deal.category === definition.slug).length
    }));

    return [
      {
        slug: 'all',
        label: 'All bargains',
        description: 'Every curated post from the community',
        icon: '🌏',
        count: deals.length
      },
      ...totals
    ];
  });

  readonly filteredDeals = computed<Deal[]>(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const selectedStream = this.selectedStream();
    const selectedCategory = this.selectedCategory();
    const onlyLocalStock = this.onlyLocalStock();
    const includeTickets = this.includeTickets();

    return this.deals()
      .filter((deal) => selectedCategory === 'all' || deal.category === selectedCategory)
      .filter((deal) => includeTickets || deal.category !== 'tickets')
      .filter((deal) => !onlyLocalStock || deal.stockType === 'local')
      .filter((deal) => {
        if (!query) {
          return true;
        }
        const haystack = [deal.title, deal.description, deal.store, ...deal.tags].join(' ').toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        if (selectedStream === 'latest') {
          return b.postedAt.getTime() - a.postedAt.getTime();
        }

        if (selectedStream === 'trending') {
          if (b.commentCount === a.commentCount) {
            return b.voteCount - a.voteCount;
          }
          return b.commentCount - a.commentCount;
        }

        if (b.heat === a.heat) {
          return b.voteCount - a.voteCount;
        }
        return b.heat - a.heat;
      });
  });

  readonly pulseMetrics = computed<MetricSummary[]>(() => {
    const deals = this.deals();
    const totalVotes = deals.reduce((acc, deal) => acc + deal.voteCount, 0);
    const dealsWithDiscount = deals.filter((deal) => deal.price !== null && deal.originalPrice);
    const freshDeals = deals.filter((deal) => Date.now() - deal.postedAt.getTime() < 1000 * 60 * 60 * 24);
    const averageDiscount = dealsWithDiscount.length
      ? Math.round(
          dealsWithDiscount.reduce((acc, deal) => acc + this.computeDiscountPercent(deal)!, 0) /
            dealsWithDiscount.length
        )
      : 0;
    const ticketCount = deals.filter((deal) => deal.category === 'tickets').length;

    return [
      {
        label: 'Live bargains',
        value: deals.length.toString(),
        meta: `${freshDeals.length} added in the last 24h`
      },
      {
        label: 'Community votes',
        value: totalVotes.toLocaleString('en-AU'),
        meta: `${averageDiscount}% median saving`
      },
      {
        label: 'Ticket watch',
        value: ticketCount.toString(),
        meta: 'BBL, Tests & tours monitored'
      }
    ];
  });

  readonly topStores = computed<StoreSummary[]>(() => {
    const storeScores = new Map<string, { deals: number; votes: number }>();

    for (const deal of this.deals()) {
      const entry = storeScores.get(deal.store) ?? { deals: 0, votes: 0 };
      entry.deals += 1;
      entry.votes += deal.voteCount;
      storeScores.set(deal.store, entry);
    }

    return Array.from(storeScores.entries())
      .map(([name, stats]) => ({
        name,
        deals: stats.deals,
        votes: stats.votes,
        score: `${Math.round(stats.votes / stats.deals)} avg votes`
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 4);
  });

  readonly communityLeaders = computed<LeaderSummary[]>(() => {
    const leaderBoard = new Map<string, { deals: number; votes: number }>();

    for (const deal of this.deals()) {
      const entry = leaderBoard.get(deal.postedBy) ?? { deals: 0, votes: 0 };
      entry.deals += 1;
      entry.votes += deal.voteCount;
      leaderBoard.set(deal.postedBy, entry);
    }

    return Array.from(leaderBoard.entries())
      .map(([name, stats]) => ({ name, deals: stats.deals, votes: stats.votes }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);
  });

  readonly trendingTags = computed<TagSummary[]>(() => {
    const tagTally = new Map<string, number>();

    for (const deal of this.deals()) {
      for (const tag of deal.tags) {
        tagTally.set(tag, (tagTally.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(tagTally.entries())
      .map(([tag, mentions]) => ({ tag, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  });

  readonly activeFilters = computed<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (this.selectedCategory() !== 'all') {
      const category = this.categories().find((item) => item.slug === this.selectedCategory());
      if (category) {
        filters.push({ key: 'category', label: category.label });
      }
    }

    if (this.onlyLocalStock()) {
      filters.push({ key: 'local-stock', label: 'Local stock only' });
    }

    if (!this.includeTickets()) {
      filters.push({ key: 'tickets', label: 'Tickets hidden' });
    }

    if (this.searchTerm().trim().length > 0) {
      filters.push({ key: 'search', label: `Search: "${this.searchTerm().trim()}"` });
    }

    return filters;
  });

  setStream(stream: StreamId): void {
    this.selectedStream.set(stream);
  }

  setCategory(slug: string): void {
    this.selectedCategory.set(slug);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.updateSearch(value);
  }

  toggleLocalStock(): void {
    this.onlyLocalStock.update((current) => !current);
  }

  toggleTickets(): void {
    this.includeTickets.update((current) => !current);
  }

  clearFilter(key: ActiveFilter['key']): void {
    switch (key) {
      case 'category':
        this.selectedCategory.set('all');
        break;
      case 'local-stock':
        this.onlyLocalStock.set(false);
        break;
      case 'tickets':
        this.includeTickets.set(true);
        break;
      case 'search':
        this.searchTerm.set('');
        break;
    }
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.onlyLocalStock.set(false);
    this.includeTickets.set(true);
    this.searchTerm.set('');
  }

  formatPrice(deal: Deal): string {
    if (deal.price === null) {
      return 'Varies';
    }

    if (deal.price === 0) {
      return 'Free';
    }

    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: deal.currency,
      minimumFractionDigits: deal.price % 1 === 0 ? 0 : 2
    }).format(deal.price);
  }

  formatDiscount(deal: Deal): string | null {
    const discount = this.computeDiscountPercent(deal);
    if (discount === null) {
      return null;
    }
    return `-${discount}%`;
  }

  relativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const absoluteMinutes = Math.round(Math.abs(diffMs) / (1000 * 60));

    const format = (value: number, unit: string): string => {
      const plural = value === 1 ? '' : 's';
      return `${value} ${unit}${plural}`;
    };

    if (diffMs < 0) {
      if (absoluteMinutes < 60) {
        return `in ${format(absoluteMinutes, 'min')}`;
      }
      const hoursAhead = Math.round(absoluteMinutes / 60);
      if (hoursAhead < 24) {
        return `in ${format(hoursAhead, 'hr')}`;
      }
      const daysAhead = Math.round(hoursAhead / 24);
      if (daysAhead < 7) {
        return `in ${format(daysAhead, 'day')}`;
      }
      const weeksAhead = Math.round(daysAhead / 7);
      return `in ${format(weeksAhead, 'wk')}`;
    }

    if (absoluteMinutes < 1) {
      return 'just now';
    }

    if (absoluteMinutes < 60) {
      return `${format(absoluteMinutes, 'min')} ago`;
    }

    const diffHours = Math.round(absoluteMinutes / 60);
    if (diffHours < 24) {
      return `${format(diffHours, 'hr')} ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {
      return `${format(diffDays, 'day')} ago`;
    }

    const diffWeeks = Math.round(diffDays / 7);
    return `${format(diffWeeks, 'wk')} ago`;
  }

  trackByDealId = (_: number, deal: Deal): number => deal.id;

  trackByCategory = (_: number, category: CategorySummary): string => category.slug;

  private computeDiscountPercent(deal: Deal): number | null {
    if (deal.price === null || !deal.originalPrice || deal.originalPrice <= 0) {
      return null;
    }

    const discount = Math.round((1 - deal.price / deal.originalPrice) * 100);
    return discount > 0 ? discount : null;
  }
}
