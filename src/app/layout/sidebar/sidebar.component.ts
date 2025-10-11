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
      label: 'Stream the action',
      description: 'Watch internationals and Big Bash via Kayo Sports or Foxtel.',
      href: 'https://help.kayosports.com.au/s/article/Where-can-I-watch-Cricket-Australia',
      ariaLabel: 'Find where to stream Australian cricket'
    },
    {
      label: 'Ticket hub',
      description: 'Secure seats for internationals, WBBL, and domestic finals.',
      href: 'https://www.cricket.com.au/tickets',
      ariaLabel: 'Open the Cricket Australia ticket hub'
    },
    {
      label: 'Join a local club',
      description: 'Use PlayCricket to discover junior and senior clubs near you.',
      href: 'https://www.playcricket.com.au/club-finder',
      ariaLabel: 'Find a local cricket club via PlayCricket'
    }
  ];

  readonly resourceLinks: SidebarCta[] = [
    {
      label: 'Domestic ladders',
      description: 'Follow Sheffield Shield, WNCL, and Premier Cricket tables.',
      href: 'https://www.cricket.com.au/matches/domestic',
      ariaLabel: 'View domestic cricket ladders'
    },
    {
      label: 'High Performance Centre',
      description: 'Insights from the National Cricket Centre and pathway squads.',
      href: 'https://www.cricket.com.au/high-performance',
      ariaLabel: 'Learn about Cricket Australia high performance programs'
    }
  ];
}
