import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ActionStep {
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-get-involved',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-involved.component.html',
  styleUrls: ['./get-involved.component.scss']
})
export class GetInvolvedComponent {
  readonly steps: ActionStep[] = [
    {
      title: 'Subscribe to match alerts',
      description: 'Get team lists, weather calls, and score updates for every Aussie XI.',
      link: 'https://www.cricket.com.au/newsletters'
    },
    {
      title: 'Join a supporter club',
      description: 'Find your local fan base and official watch party partners.',
      link: 'https://www.cricket.com.au/fans/club-registrations'
    },
    {
      title: 'Volunteer at community cricket',
      description: 'Help coach, score, or umpire through Cricket Australia pathway programs.',
      link: 'https://www.community.cricket.com.au/clubs/volunteers'
    }
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
