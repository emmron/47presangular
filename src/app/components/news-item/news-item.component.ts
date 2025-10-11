import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsItem, MediaAsset } from '../../models/news.model';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss']
})
export class NewsItemComponent {
  @Input({ required: true }) item!: NewsItem;

  get primaryImage(): MediaAsset | undefined {
    return this.item.mediaAssets.find(asset => asset.type === 'IMAGE');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
