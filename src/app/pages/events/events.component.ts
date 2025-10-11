import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FixtureEvent {
  title: string;
  location: string;
  date: string;
  description: string;
  matchUrl: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  readonly events: FixtureEvent[] = [
    {
      title: 'Australia vs India – 1st Test',
      location: 'Perth Stadium, Perth',
      date: '24 November 2024',
      description: 'The home summer opens with a day-night Test as Australia leans on a three-prong pace attack.',
      matchUrl: 'https://www.cricket.com.au/series/australia-v-india-test-series'
    },
    {
      title: 'Sydney Sixers vs Brisbane Heat – BBL',
      location: 'Sydney Cricket Ground, Sydney',
      date: '12 December 2024',
      description: 'Two finals contenders clash with marquee all-rounders fresh from overseas stints.',
      matchUrl: 'https://www.cricket.com.au/fixtures'
    },
    {
      title: 'WNCL Final',
      location: 'Allan Border Field, Brisbane',
      date: '22 February 2025',
      description: 'State pride on the line with national selectors watching every over for breakout stars.',
      matchUrl: 'https://www.cricket.com.au/series/wncl'
    }
  ];
}
