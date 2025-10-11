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
      title: 'Join Team Australia',
      description: 'Register for the official supporter program and access pre-sale tickets.',
      link: 'https://www.cricket.com.au/membership'
    },
    {
      title: 'Volunteer at your club',
      description: 'Use Cricket Australia’s club finder to lend a hand with coaching or scoring.',
      link: 'https://www.community.cricket.com.au/clubs/find-a-club'
    },
    {
      title: 'Set up score alerts',
      description: 'Subscribe to push notifications for men’s and women’s internationals, BBL, and WBBL.',
      link: 'https://www.cricket.com.au/email-newsletters'
    }
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
