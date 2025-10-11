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
    { label: 'Latest News', route: '/news' },
    { label: 'Match Centre', route: '/dashboard' },
    { label: 'Fixtures', route: '/events' },
    { label: 'Fan Hub', route: '/get-involved' }
  ];

  readonly megaMenuSections: MegaMenuSection[] = [
    {
      heading: 'National Teams',
      items: [
        {
          label: "Men's Internationals",
          description: 'Test, ODI, and T20 squads, selections, and injury updates.',
          route: '/issues',
          fragment: 'mens-australia'
        },
        {
          label: "Women's Internationals",
          description: 'Southern Stars touring news, selection calls, and form guide.',
          route: '/issues',
          fragment: 'womens-australia'
        }
      ]
    },
    {
      heading: 'Domestic Leagues',
      items: [
        {
          label: 'Big Bash League',
          description: 'BBL and WBBL squad moves, draft coverage, and marquee moments.',
          route: '/issues',
          fragment: 'big-bash'
        },
        {
          label: 'Sheffield Shield & Marsh Cup',
          description: 'Red-ball form lines and one-day ladder implications for selectors.',
          route: '/issues',
          fragment: 'sheffield-shield'
        }
      ]
    },
    {
      heading: 'Pathways & Community',
      items: [
        {
          label: 'Premier Cricket',
          description: 'Club cricket standouts and NextGen prospects to keep an eye on.',
          route: '/issues',
          fragment: 'premier-cricket'
        },
        {
          label: 'Participation & Grassroots',
          description: 'Participation programs, community grants, and inclusion initiatives.',
          route: '/issues',
          fragment: 'community-cricket'
        }
      ]
    }
  ];

  readonly ctas: CtaLink[] = [
    {
      label: 'Subscribe',
      description: 'Weekly digest direct from Aussie Cricket Pulse editors.',
      href: 'https://www.cricket.com.au/newsletters',
      style: 'primary'
    },
    {
      label: 'Buy Tickets',
      description: 'Secure seats for internationals and Big Bash blockbusters.',
      href: 'https://www.cricket.com.au/tickets',
      style: 'outline'
    },
    {
      label: 'Find a Club',
      description: 'Join a local side through the national PlayCricket directory.',
      href: 'https://www.playcricket.com.au/club-finder',
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
