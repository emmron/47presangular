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
      title: 'Join the grassroots team',
      description: 'Become a neighborhood captain to coordinate phone banks and canvasses.',
      link: 'https://www.donaldjtrump.com/join/'
    },
    {
      title: 'Host a house meeting',
      description: 'Download our toolkit and invite supporters for a rapid response briefing.',
      link: 'https://www.donaldjtrump.com/get-involved/'
    },
    {
      title: 'Digital rapid responders',
      description: 'Amplify campaign messaging with social media share kits and daily talking points.',
      link: 'https://www.donaldjtrump.com/subscribe/'
    }
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
