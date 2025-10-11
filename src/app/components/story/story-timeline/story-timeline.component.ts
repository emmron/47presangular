import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TimelineEvent } from '../../../models/news.model';

@Component({
  selector: 'app-story-timeline',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './story-timeline.component.html',
  styleUrls: ['./story-timeline.component.scss']
})
export class StoryTimelineComponent {
  @Input() events: TimelineEvent[] | null = null;

  parseDate(date: string): Date {
    return new Date(date);
  }
}
