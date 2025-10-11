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
      label: 'Join 12th Man',
      description: 'Support the national teams with exclusive member perks.',
      href: 'https://www.cricket.com.au/12thman',
      ariaLabel: 'Join the Cricket Australia 12th Man supporters club'
    },
    {
      label: 'Club cricket hub',
      description: 'Register your local side and find club resources.',
      href: 'https://play.cricket.com.au/',
      ariaLabel: 'Open the community club cricket registration hub'
    },
    {
      label: 'Match alerts',
      description: 'Sign up for email and push alerts on Aussie fixtures.',
      href: 'https://www.cricket.com.au/newsletters',
      ariaLabel: 'Subscribe to Australian cricket match alerts'
    }
  ];

  readonly resourceLinks: SidebarCta[] = [
    {
      label: 'Domestic fixtures',
      description: 'Sheffield Shield, WNCL, and premier cricket schedules.',
      href: 'https://www.cricket.com.au/fixtures',
      ariaLabel: 'Browse Australian domestic cricket fixtures'
    },
    {
      label: 'Broadcast guide',
      description: 'Find streaming and radio options for every league.',
      href: 'https://www.cricket.com.au/broadcast-guide',
      ariaLabel: 'Open the Australian cricket broadcast guide'
    }
  ];
}
