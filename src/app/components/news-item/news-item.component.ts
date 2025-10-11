import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GalleryItem, MediaCaption, NewsItem } from '../../models/news.model';
import { NewsItem, MediaAsset } from '../../models/news.model';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss']
})
export class NewsItemComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() item: NewsItem | null = null;

  formatDate(date: Date | string): string {
    const dateValue = typeof date === 'string' ? new Date(date) : date;
    return dateValue.toLocaleDateString('en-US', {
  @Input({ required: true }) item!: NewsItem;

  get primaryImage(): MediaAsset | undefined {
    return this.item.mediaAssets.find(asset => asset.type === 'IMAGE');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
  @Input() item!: NewsItem;

  constructor(
    private readonly tracking: TrackingService,
    private readonly referrals: ReferralService
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

  formatDuration(seconds?: number | null): string | null {
    if (!seconds || seconds <= 0) {
      return null;
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    }

    return `${remainingSeconds}s`;
  }

  getSafeEmbedUrl(item: NewsItem | null): SafeResourceUrl | null {
    if (!item?.embedUrl) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(item.embedUrl);
  }

  getAudioSource(item: NewsItem | null): string | null {
    if (!item) {
      return null;
    }
    return item.embedUrl || item.link;
  }

  trackByGalleryItem(_index: number, galleryItem: GalleryItem): string {
    return galleryItem.url;
  }

  trackByCaption(_index: number, caption: MediaCaption): string {
    return caption.url ?? caption.text;
  }

  getTranscriptText(item: NewsItem | null): string | null {
    return item?.transcriptText ?? null;
  }

  getTranscriptUrl(item: NewsItem | null): string | null {
    return item?.transcriptUrl ?? null;
  }

  toIsoString(date: Date | string): string {
    const dateValue = typeof date === 'string' ? new Date(date) : date;
    return dateValue.toISOString();
  get detailRoute(): string[] {
    return ['/news', this.item.id];
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
      referralCode
    } as const;
    const trackedUrl = this.tracking.buildTrackedUrl(this.item.link, params);
    const encodedTitle = encodeURIComponent(this.item.title);
    const encodedUrl = encodeURIComponent(trackedUrl);

    return [
      {
        network: 'x',
        label: 'Share on X',
        url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        icon: '🐦'
      },
      {
        network: 'facebook',
        label: 'Share on Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        icon: '📘'
      },
      {
        network: 'telegram',
        label: 'Share on Telegram',
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        icon: '📨'
      }
    ];
  }

  onShare(network: ShareLink['network']): void {
    this.tracking.emitEvent('news_share', {
      network,
      newsId: this.item.id
    });
  }
}
