import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorySource } from '../../../models/news.model';

@Component({
  selector: 'app-source-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-list.component.html',
  styleUrls: ['./source-list.component.scss']
})
export class SourceListComponent {
  @Input() sources: StorySource[] | null = null;

  trackByUrl(_index: number, source: StorySource): string {
    return source.url;
  }
}
