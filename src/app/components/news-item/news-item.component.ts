import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GalleryItem, MediaCaption, NewsItem } from '../../models/news.model';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-item.component.html',
  styleUrl: './news-item.component.scss'
})
export class NewsItemComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() item: NewsItem | null = null;

  formatDate(date: Date | string): string {
    const dateValue = typeof date === 'string' ? new Date(date) : date;
    return dateValue.toLocaleDateString('en-US', {
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
  }
}
