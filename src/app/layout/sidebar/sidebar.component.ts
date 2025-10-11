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
      label: 'Ticket finder',
      description: 'Browse upcoming internationals and Big Bash fixtures.',
      href: 'https://www.cricket.com.au/tickets',
      ariaLabel: 'Open the Cricket Australia ticket finder'
    },
    {
      label: 'Club locator',
      description: 'Connect with local clubs through PlayCricket.',
      href: 'https://play.cricket.com.au/clubs',
      ariaLabel: 'Find a local cricket club via PlayCricket'
    },
    {
      label: 'Match Centre app',
      description: 'Download the CA Live app for scores and highlights.',
      href: 'https://www.cricket.com.au/live',
      ariaLabel: 'Download the Cricket Australia Live app'
    }
  ];

  readonly resourceLinks: SidebarCta[] = [
    {
      label: 'National team hub',
      description: 'Official news on Australian squads and selection.',
      href: 'https://www.cricket.com.au/teams/australia-men',
      ariaLabel: 'View official Australian national team news'
    },
    {
      label: 'Community cricket',
      description: 'Participation resources and programs nationwide.',
      href: 'https://www.community.cricket.com.au/',
      ariaLabel: 'Explore Community Cricket resources'
    }
  ];
}
