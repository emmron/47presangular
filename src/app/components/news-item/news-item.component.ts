import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsItem } from '../../models/news.model';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-item.component.html',
  styleUrl: './news-item.component.scss'
})
export class NewsItemComponent {
  @Input() item!: NewsItem;
  @Input() isSaved = false;
  @Input() isAuthenticated = false;
  @Output() save = new EventEmitter<NewsItem>();

  formatDate(date: Date | string): string {
    const resolvedDate = typeof date === 'string' ? new Date(date) : date;
    return resolvedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onSave(): void {
    if (this.isSaved) {
      return;
    }
    this.save.emit(this.item);
  }
}
