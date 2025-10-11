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
      title: 'Rust Belt Jobs Rally',
      location: 'Erie, Pennsylvania',
      date: 'June 22, 2024',
      description: 'Manufacturing workers and small business owners share testimonies on economic revival.',
      rsvpUrl: 'https://www.donaldjtrump.com/events/'
    },
    {
      title: 'Border Security Town Hall',
      location: 'Yuma, Arizona',
      date: 'June 24, 2024',
      description: 'Policy roundtable featuring sheriffs, border agents, and Angel families.',
      rsvpUrl: 'https://www.donaldjtrump.com/events/'
    },
    {
      title: 'Faith & Freedom Summit',
      location: 'Greenville, South Carolina',
      date: 'June 27, 2024',
      description: 'Pastors, faith leaders, and youth ministries coordinating voter outreach.',
      rsvpUrl: 'https://www.donaldjtrump.com/events/'
    }
  ];
}
