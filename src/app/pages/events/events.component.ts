import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CricketEvent {
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
  readonly events: CricketEvent[] = [
    {
      title: 'NRMA Insurance Test – Australia v India (Perth)',
      location: 'Optus Stadium, Perth',
      date: '25–29 November 2024',
      description: 'Day-night opener of the Border-Gavaskar Trophy with fan zones and junior coaching clinics on the outer.',
      rsvpUrl: 'https://www.cricket.com.au/tickets'
    },
    {
      title: 'WBBL Semi-Final Fan Night',
      location: 'North Sydney Oval, Sydney',
      date: '4 December 2024',
      description: 'Meet the players, collect autographs, and enjoy live music before the knockout begins.',
      rsvpUrl: 'https://www.cricket.com.au/news/wbbl-finals-hub/2024-10-31'
    },
    {
      title: 'Big Bash League Opening Weekend Live Site',
      location: 'King George Square, Brisbane',
      date: '7–8 December 2024',
      description: 'Free entry fan zone with big screens, player Q&amp;As, and junior skills sessions hosted by Queensland Cricket.',
      rsvpUrl: 'https://www.brisbaneheat.com.au/fans'
    }
  ];
}
