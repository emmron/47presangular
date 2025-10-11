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
      description: 'Get fixture reminders and squad news direct from Cricket Australia.',
      link: 'https://www.cricket.com.au/newsletters'
    },
    {
      title: 'Volunteer with community cricket',
      description: 'Support junior programs and festivals in your state.',
      link: 'https://www.community.cricket.com.au/volunteers'
    },
    {
      title: 'Support a local club',
      description: 'Find a club near you and help keep grassroots cricket thriving.',
      link: 'https://play.cricket.com.au/clubs'
    }
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
