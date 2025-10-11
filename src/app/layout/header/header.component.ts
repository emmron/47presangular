import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  route: string;
}

interface MegaMenuItem {
  label: string;
  description: string;
  route: string;
  fragment?: string;
}

interface MegaMenuSection {
  heading: string;
  items: MegaMenuItem[];
}

interface CtaLink {
  label: string;
  description: string;
  href: string;
  style: 'primary' | 'outline' | 'ghost';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  megaMenuOpen = false;

  readonly navLinks: NavLink[] = [
    { label: 'News', route: '/news' },
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Events', route: '/events' },
    { label: 'Get Involved', route: '/get-involved' }
  ];

  readonly megaMenuSections: MegaMenuSection[] = [
    {
      heading: 'Top Priorities',
      items: [
        {
          label: 'Economic Agenda',
          description: 'Jobs, inflation, and trade policy priorities.',
          route: '/issues',
          fragment: 'economy'
        },
        {
          label: 'Border & Security',
          description: 'Immigration, national defense, and public safety.',
          route: '/issues',
          fragment: 'security'
        }
      ]
    },
    {
      heading: 'Policy Pillars',
      items: [
        {
          label: 'Healthcare & Social',
          description: 'Healthcare access, veteran services, and family support.',
          route: '/issues',
          fragment: 'healthcare'
        },
        {
          label: 'Election Integrity',
          description: 'Voting reforms and oversight initiatives.',
          route: '/issues',
          fragment: 'elections'
        }
      ]
    },
    {
      heading: 'Movement Voices',
      items: [
        {
          label: 'Grassroots Spotlights',
          description: 'Community stories and volunteer organizing.',
          route: '/issues',
          fragment: 'grassroots'
        },
        {
          label: 'Media Statements',
          description: 'Campaign press releases and official responses.',
          route: '/issues',
          fragment: 'media'
        }
      ]
    }
  ];

  readonly ctas: CtaLink[] = [
    {
      label: 'Donate',
      description: 'Power the movement with a contribution.',
      href: 'https://www.donaldjtrump.com/',
      style: 'primary'
    },
    {
      label: 'Volunteer',
      description: 'Host events or knock doors in your community.',
      href: 'https://www.donaldjtrump.com/join/',
      style: 'outline'
    },
    {
      label: 'Subscribe',
      description: 'Get rapid response alerts from campaign HQ.',
      href: 'https://www.donaldjtrump.com/subscribe/',
      style: 'ghost'
    }
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleMegaMenu(force?: boolean): void {
    this.megaMenuOpen = force ?? !this.megaMenuOpen;
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeOverlays();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  closeOverlays(): void {
    this.megaMenuOpen = false;
    this.isMobileMenuOpen = false;
  }
}
