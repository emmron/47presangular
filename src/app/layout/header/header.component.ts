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
    { label: 'Storylines', route: '/timeline' },
    { label: 'Stats Hub', route: '/dashboard' },
    { label: 'Fixtures', route: '/events' },
    { label: 'Fan Zone', route: '/get-involved' }
  ];

  readonly megaMenuSections: MegaMenuSection[] = [
    {
      heading: 'National Teams',
      items: [
        {
          label: 'Baggy Greens',
          description: 'Men’s Test, ODI, and T20 squads in focus.',
          route: '/issues',
          fragment: 'australia-men'
        },
        {
          label: 'Southern Stars',
          description: 'Women’s teams chasing silverware worldwide.',
          route: '/issues',
          fragment: 'australia-women'
        }
      ]
    },
    {
      heading: 'Domestic Leagues',
      items: [
        {
          label: 'Big Bash League',
          description: 'BBL & WBBL ladder updates and transfer buzz.',
          route: '/issues',
          fragment: 'big-bash'
        },
        {
          label: 'Sheffield Shield',
          description: 'Four-day form and selection watch.',
          route: '/issues',
          fragment: 'sheffield-shield'
        }
      ]
    },
    {
      heading: 'Pathways & Fans',
      items: [
        {
          label: 'State Competitions',
          description: 'Marsh Cup and WNCL talking points.',
          route: '/issues',
          fragment: 'state-competitions'
        },
        {
          label: 'Supporter Stories',
          description: 'Fan initiatives and club cricket highlights.',
          route: '/issues',
          fragment: 'fan-stories'
        }
      ]
    }
  ];

  readonly ctas: CtaLink[] = [
    {
      label: 'Watch Live',
      description: 'Stream internationals and Big Bash fixtures.',
      href: 'https://www.kayosports.com.au/',
      style: 'primary'
    },
    {
      label: 'Join Cricket Club',
      description: 'Find local programs through Cricket Australia.',
      href: 'https://www.community.cricket.com.au/clubs/find-a-club',
      style: 'outline'
    },
    {
      label: 'Score Alerts',
      description: 'Get push alerts when Aussies hit the field.',
      href: 'https://www.cricket.com.au/email-newsletters',
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
