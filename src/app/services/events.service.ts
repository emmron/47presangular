import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, of } from 'rxjs';
import { CampaignEvent, EventFilter } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly officialEvents: CampaignEvent[] = [
    {
      id: 'ofc-1',
      name: 'Economic Renewal Address',
      description: 'Remarks on the campaign\'s economic plan and small business agenda.',
      start: '2024-08-10T18:00:00Z',
      end: '2024-08-10T20:00:00Z',
      type: 'official',
      location: {
        venue: 'Civic Center Plaza',
        city: 'Phoenix',
        state: 'AZ',
        coordinates: [33.4484, -112.074],
      },
      rsvpUrl: 'https://events.47campaign.com/economic-renewal',
    },
    {
      id: 'ofc-2',
      name: 'Veterans Coalition Roundtable',
      description: 'Closed-door roundtable with veterans advocates and campaign surrogates.',
      start: '2024-08-15T14:30:00Z',
      end: '2024-08-15T16:00:00Z',
      type: 'official',
      location: {
        venue: 'Patriot Hall',
        city: 'Tampa',
        state: 'FL',
        coordinates: [27.9506, -82.4572],
      },
      rsvpUrl: 'https://events.47campaign.com/veterans-roundtable',
    },
  ];

  private readonly grassrootsCheckIns: CampaignEvent[] = [
    {
      id: 'rly-1',
      name: 'Grassroots Rally & Cookout',
      description: 'County coordinators and volunteers hosting a community rally and cookout.',
      start: '2024-08-11T20:00:00Z',
      end: '2024-08-11T23:00:00Z',
      type: 'rally',
      location: {
        venue: 'Freedom Park',
        city: 'Columbus',
        state: 'OH',
        coordinates: [39.9612, -82.9988],
      },
      checkIns: 864,
    },
    {
      id: 'rly-2',
      name: 'Border Security Bus Tour Stop',
      description: 'Supporters checking in to hear from campaign surrogates on border policy.',
      start: '2024-08-18T17:00:00Z',
      end: '2024-08-18T19:00:00Z',
      type: 'community',
      location: {
        venue: 'Rio Grande Plaza',
        city: 'McAllen',
        state: 'TX',
        coordinates: [26.2034, -98.23],
      },
      checkIns: 412,
    },
  ];

  getCombinedEvents(filter?: EventFilter): Observable<CampaignEvent[]> {
    return combineLatest([
      of(this.officialEvents),
      of(this.grassrootsCheckIns),
    ]).pipe(
      map(([official, grassroots]) => [...official, ...grassroots]),
      map((events) =>
        events.filter((event) => {
          if (!filter) {
            return true;
          }
          const matchesType =
            !filter.type || filter.type === 'all' || event.type === filter.type;
          const matchesState =
            !filter.state || event.location.state === filter.state;
          return matchesType && matchesState;
        })
      ),
      map((events) =>
        events.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
      )
    );
  }
}
