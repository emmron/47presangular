import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsItem } from '../../models/news.model';
import { TrackingService } from '../../services/tracking.service';
import { ReferralService } from '../../services/referral.service';

interface ShareLink {
  network: 'x' | 'facebook' | 'telegram';
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-item.component.html',
  styleUrl: './news-item.component.scss'
})
export class NewsItemComponent {
  @Input() item!: NewsItem;

  constructor(
    private tracking: TrackingService,
    private referrals: ReferralService,
  ) {}

  formatDate(date: string | Date): string {
    const value = typeof date === 'string' ? new Date(date) : date;
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get dateTimeAttr(): string {
    const value = this.item.pubDate instanceof Date ? this.item.pubDate : new Date(this.item.pubDate);
    return value.toISOString();
  }

  get shareLinks(): ShareLink[] {
    const referralCode = this.referrals.getReferralCode();
    const params = {
      source: 'news_card',
      medium: 'social_share',
      campaign: 'news_distribution',
      content: this.item.id,
      referralCode,
    };
    const trackedUrl = this.tracking.buildTrackedUrl(this.item.link, params);
    const encodedTitle = encodeURIComponent(this.item.title);
    const encodedUrl = encodeURIComponent(trackedUrl);

    return [
      {
        network: 'x',
        label: 'Share on X',
        url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        icon: '🐦',
      },
      {
        network: 'facebook',
        label: 'Share on Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        icon: '📘',
      },
      {
        network: 'telegram',
        label: 'Share on Telegram',
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        icon: '📨',
      },
    ];
  }

  onShare(network: string): void {
    this.tracking.emitEvent('news_share', {
      network,
      newsId: this.item.id,
    });
  }
}
