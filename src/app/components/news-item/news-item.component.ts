import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsItem } from '../../models/news.model';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-item.component.html',
  styleUrl: './news-item.component.scss'
})
export class NewsItemComponent {
  @Input() item!: NewsItem;

  formatDate(date: Date | string): string {
    const value = typeof date === 'string' ? new Date(date) : date;
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get detailRoute(): string[] {
    return ['/news', this.item.id];
  }

  toIsoString(date: Date | string): string {
    const value = typeof date === 'string' ? new Date(date) : date;
    return value.toISOString();
  }
}
