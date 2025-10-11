import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CricketFixture {
  title: string;
  location: string;
  date: string;
  description: string;
  rsvpUrl: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  readonly events: CricketFixture[] = [
    {
      title: 'Australia vs Sri Lanka 2nd ODI',
      location: 'Blundstone Arena, Hobart',
      date: 'November 17, 2024',
      description: 'Day-night clash with World Cup qualification points on the line and a potential debut for Jake Fraser-McGurk.',
      rsvpUrl: 'https://www.cricket.com.au/series/aus-v-sl-2024-fixtures'
    },
    {
      title: 'BBL|14 Opening Night: Sixers v Heat',
      location: 'Sydney Cricket Ground',
      date: 'December 7, 2024',
      description: 'The defending champions face Brisbane under lights to launch the summer with fireworks and a new power surge rule tweak.',
      rsvpUrl: 'https://www.bigbash.com.au/match/1'
    },
    {
      title: 'Sheffield Shield Final',
      location: 'Sydney Cricket Ground',
      date: 'March 24, 2025',
      description: 'Five-day decider featuring NSW and Tasmania with Test spots up for grabs ahead of the Ashes.',
      rsvpUrl: 'https://www.cricket.com.au/series/sheffield-shield-2024-25/fixtures'
    }
  ];
}
