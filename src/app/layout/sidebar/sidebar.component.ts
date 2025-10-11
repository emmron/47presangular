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
      label: 'Live scores',
      description: 'Track every Aussie innings via cricket.com.au.',
      href: 'https://www.cricket.com.au/matches/live',
      ariaLabel: 'Open live scores on cricket dot com dot au'
    },
    {
      label: 'Memberships',
      description: 'Explore Cricket Australia supporter memberships.',
      href: 'https://www.cricket.com.au/membership',
      ariaLabel: 'Browse Cricket Australia membership options'
    },
    {
      label: 'Fan newsletter',
      description: 'Sign up for weekly highlights from every league.',
      href: 'https://www.cricket.com.au/email-newsletters',
      ariaLabel: 'Subscribe to the Cricket Australia email newsletter'
    }
  ];

  readonly resourceLinks: SidebarCta[] = [
    {
      label: 'Domestic fixtures',
      description: 'Sheffield Shield, Marsh Cup, and WNCL schedules.',
      href: 'https://www.cricket.com.au/series',
      ariaLabel: 'View domestic cricket fixtures'
    },
    {
      label: 'Big Bash tickets',
      description: 'Secure seats for BBL and WBBL double-headers.',
      href: 'https://www.bigbash.com.au/tickets',
      ariaLabel: 'Open the Big Bash League ticket portal'
    }
  ];
}
