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
      title: 'Volunteer at community cricket',
      description: 'Register with your state association to coach, score, or help run match days.',
      link: 'https://www.playcricket.com.au/clubs/volunteers'
    },
    {
      title: 'Umpiring & scoring pathway',
      description: 'Complete online accreditation and join the roster for local and Premier Cricket fixtures.',
      link: 'https://www.cricketaustralia.com.au/umpiring'
    },
    {
      title: 'High performance newsletter',
      description: 'Get high performance updates, training resources, and talent ID opportunities.',
      link: 'https://www.cricket.com.au/newsletters'
    }
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
  }
}
