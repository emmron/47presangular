import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CampaignEvent {
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
  readonly events: CampaignEvent[] = [
    {
      title: 'Australia vs New Zealand – 1st Test',
      location: 'Basin Reserve, Wellington',
      date: 'February 29, 2024',
      description: 'Baggy Greens return across the ditch with a day-one start at 10:00am NZDT.',
      rsvpUrl: 'https://www.cricket.com.au/series/australia-tour-of-new-zealand-2024'
    },
    {
      title: 'Women’s National Cricket League Final',
      location: 'North Sydney Oval, Sydney',
      date: 'March 2, 2024',
      description: 'Breakers meet the Tigers in a rematch streamed live on Kayo and ABC Grandstand.',
      rsvpUrl: 'https://www.cricket.com.au/news/wncl-final-preview/'
    },
    {
      title: 'BBL|14 Contracting Window Opens',
      location: 'Cricket Australia HQ & digital stream',
      date: 'March 15, 2024',
      description: 'Clubs begin lodging marquee signings; watch the live recap with team list analysts.',
      rsvpUrl: 'https://www.cricket.com.au/news/bbl-signings-window/'
    }
  ];
}
