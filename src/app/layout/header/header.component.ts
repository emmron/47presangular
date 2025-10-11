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
    { label: 'Fixtures', route: '/events' },
    { label: 'Get Involved', route: '/get-involved' }
  ];

  readonly megaMenuSections: MegaMenuSection[] = [
    {
      heading: 'International Focus',
      items: [
        {
          label: "Men's internationals",
          description: 'Test, ODI, and T20 tour outlooks for the national side.',
          route: '/issues',
          fragment: 'internationals'
        },
        {
          label: "Women's internationals",
          description: 'Series updates, selection talking points, and rival previews.',
          route: '/issues',
          fragment: 'womens-internationals'
        }
      ]
    },
    {
      heading: 'Domestic Spotlight',
      items: [
        {
          label: 'Sheffield Shield & Marsh Cup',
          description: 'State squads, form lines, and ladder movement.',
          route: '/issues',
          fragment: 'domestic'
        },
        {
          label: 'Big Bash leagues',
          description: 'BBL and WBBL headlines, contracts, and trade whispers.',
          route: '/issues',
          fragment: 'big-bash'
        }
      ]
    },
    {
      heading: 'Pathways & Community',
      items: [
        {
          label: 'Premier cricket focus',
          description: 'Club cricket standouts pushing for higher honours.',
          route: '/issues',
          fragment: 'pathways'
        },
        {
          label: 'Participation & growth',
          description: 'Nationwide initiatives growing the game.',
          route: '/issues',
          fragment: 'participation'
        }
      ]
    }
  ];

  readonly ctas: CtaLink[] = [
    {
      label: 'Buy Tickets',
      description: 'Secure seats for upcoming internationals and domestic fixtures.',
      href: 'https://www.cricket.com.au/tickets',
      style: 'primary'
    },
    {
      label: 'Stream Matches',
      description: 'Catch every ball with the latest streaming subscriptions.',
      href: 'https://kayosports.com.au/',
      style: 'outline'
    },
    {
      label: 'Join a Club',
      description: 'Find a local program through Cricket Australia Club Finder.',
      href: 'https://www.community.cricket.com.au/clubfinder',
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
