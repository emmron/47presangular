import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventMapService } from '../../../services/event-map.service';
import { MediaDataService } from '../../../services/media-data.service';
import { EventLocation } from '../../../models/media.model';

@Component({
  selector: 'app-event-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  events: EventLocation[] = [];
  loading = true;
  error: string | null = null;

  private eventsSubscription?: Subscription;

  constructor(
    private readonly eventMapService: EventMapService,
    private readonly mediaDataService: MediaDataService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.eventMapService.initialize(this.mapContainer.nativeElement);

    this.eventsSubscription = this.mediaDataService.getUpcomingEvents().subscribe({
      next: events => {
        this.events = events;
        this.loading = false;
        this.error = null;
        this.eventMapService.plotEvents(events);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load upcoming events map.';
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.eventMapService.destroy();
  }

  trackByEventId(_: number, event: EventLocation): string {
    return event.id;
  }
}
