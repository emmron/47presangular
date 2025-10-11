import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SidebarCta {
  label: string;
  description: string;
  href: string;
  ariaLabel: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  readonly takeActionCtas: SidebarCta[] = [
    {
      label: 'Chip in $20.24',
      description: 'Donate to accelerate key battleground operations.',
      href: 'https://www.donaldjtrump.com/',
      ariaLabel: 'Donate twenty dollars and twenty four cents'
    },
    {
      label: 'Become a Captain',
      description: 'Lead local volunteer teams and coordinate canvasses.',
      href: 'https://www.donaldjtrump.com/join/',
      ariaLabel: 'Sign up to become a neighborhood captain'
    },
    {
      label: 'Rapid Response List',
      description: 'Get SMS alerts for breaking news and key votes.',
      href: 'https://www.donaldjtrump.com/subscribe/',
      ariaLabel: 'Subscribe to the Trump rapid response list'
    }
  ];

  readonly resourceLinks: SidebarCta[] = [
    {
      label: 'State Leadership',
      description: 'Find your state director and field staff.',
      href: 'https://www.donaldjtrump.com/states/',
      ariaLabel: 'Explore state leadership contacts'
    },
    {
      label: 'Events Calendar',
      description: 'See rallies, town halls, and digital events near you.',
      href: 'https://www.donaldjtrump.com/events/',
      ariaLabel: 'Open the campaign events calendar'
    }
  ];
}
