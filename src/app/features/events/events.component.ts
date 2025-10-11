import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as L from 'leaflet';
import { CampaignEvent } from '../../models/event.model';
import { EventsService } from '../../services/events.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  filterForm!: FormGroup;
  events$!: Observable<CampaignEvent[]>;
  upcomingStates$!: Observable<string[]>;

  private readonly destroy$ = new Subject<void>();
  private map?: L.Map;
  private markersLayer?: L.LayerGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly eventsService: EventsService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      type: ['all'],
      state: [''],
    });

    const allEvents$ = this.eventsService.getCombinedEvents().pipe(shareReplay(1));

    this.upcomingStates$ = allEvents$.pipe(
      map((events) =>
        Array.from(new Set(events.map((event) => event.location.state))).sort()
      )
    );

    this.events$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap((filters) =>
        this.eventsService.getCombinedEvents({
          type: filters.type,
          state: filters.state || undefined,
        })
      ),
      tap((events) => this.renderMarkers(events))
    );
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.map = L.map('events-map', {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([37.8, -96], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    this.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe((events) => this.renderMarkers(events));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.map) {
      this.map.remove();
    }
  }

  trackByEvent(_: number, event: CampaignEvent): string {
    return event.id;
  }

  private renderMarkers(events: CampaignEvent[]): void {
    if (!this.map || !this.markersLayer) {
      return;
    }

    this.markersLayer.clearLayers();

    events.forEach((event) => {
      const marker = L.marker(event.location.coordinates, {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        }),
      });

      marker.bindPopup(
        `<strong>${event.name}</strong><br/>${event.location.venue}<br/>${event.location.city}, ${event.location.state}<br/>${new Date(
          event.start
        ).toLocaleString()}`
      );

      marker.addTo(this.markersLayer as L.LayerGroup);
    });
  }
}
