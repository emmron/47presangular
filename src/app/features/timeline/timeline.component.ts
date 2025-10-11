import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { TimelineEntry, TimelineCategory } from '../../models/timeline.model';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent implements OnInit {
  filterControl = this.fb.control<'all' | TimelineCategory>('all');
  timeline$!: Observable<TimelineEntry[]>;
  copiedEmbed = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly timelineService: TimelineService
  ) {}

  ngOnInit(): void {
    this.timeline$ = this.filterControl.valueChanges.pipe(
      startWith(this.filterControl.value),
      switchMap((category) => this.timelineService.getTimeline(category ?? 'all')),
      map((entries) =>
        entries.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      )
    );
  }

  exportTimeline(entries: TimelineEntry[]): void {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campaign-timeline.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async copyEmbedCode(): Promise<void> {
    const embed = `\
<div class="campaign-timeline" data-endpoint="https://api.47campaign.com/public/timeline"></div>\n<script src="https://cdn.47campaign.com/sdk/timeline.js" async></script>`;
    await navigator.clipboard.writeText(embed);
    this.copiedEmbed = true;
    setTimeout(() => (this.copiedEmbed = false), 2000);
  }

  trackByTimeline(_: number, entry: TimelineEntry): string {
    return entry.id;
  }
}
