import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PollQuestion } from '../../models/engagement.model';
import { EngagementService } from '../../services/engagement.service';

interface PollViewModel extends PollQuestion {
  lastUpdatedRelative: string;
}

@Component({
  selector: 'app-poll-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poll-widget.component.html',
  styleUrls: ['./poll-widget.component.scss']
})
export class PollWidgetComponent implements OnInit {
  polls$!: Observable<PollViewModel[]>;

  constructor(private engagementService: EngagementService) { }

  ngOnInit(): void {
    this.polls$ = this.engagementService.fetchPollResults().pipe(
      map(polls => polls.map(poll => ({
        ...poll,
        lastUpdatedRelative: this.formatRelativeTime(poll.lastUpdated)
      })))
    );
  }

  private formatRelativeTime(timestamp: string): string {
    const updated = new Date(timestamp).getTime();
    const diffMs = Date.now() - updated;
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}
