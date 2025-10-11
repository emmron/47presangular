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
    { label: 'Fan Hub', route: '/get-involved' }
  ];

  readonly megaMenuSections: MegaMenuSection[] = [
    {
      heading: 'National Teams',
      items: [
        {
          label: "Men's internationals",
          description: 'Test, ODI, and T20 focus for the Baggy Greens.',
          route: '/issues',
          fragment: 'international-men'
        },
        {
          label: "Women's internationals",
          description: 'Southern Stars tour news and form guide.',
          route: '/issues',
          fragment: 'international-women'
        }
      ]
    },
    {
      heading: 'Domestic Leagues',
      items: [
        {
          label: 'Sheffield Shield & Marsh Cup',
          description: 'Red-ball updates and one-day cup storylines.',
          route: '/issues',
          fragment: 'domestic-red-ball'
        },
        {
          label: 'Big Bash spotlight',
          description: 'BBL & WBBL squads, trades, and table watch.',
          route: '/issues',
          fragment: 'big-bash'
        }
      ]
    },
    {
      heading: 'Pathways & Culture',
      items: [
        {
          label: 'Emerging talent',
          description: 'Academy prospects and Australia A tours.',
          route: '/issues',
          fragment: 'pathways'
        },
        {
          label: 'Community & media',
          description: 'Grassroots stories and broadcast developments.',
          route: '/issues',
          fragment: 'community-media'
        }
      ]
    }
  ];

  readonly ctas: CtaLink[] = [
    {
      label: 'Stream matches',
      description: 'Watch live cricket on Kayo & Foxtel.',
      href: 'https://kayosports.com.au/',
      style: 'primary'
    },
    {
      label: 'Join 12th Man',
      description: 'Become a Cricket Australia supporter member.',
      href: 'https://www.cricket.com.au/12thman',
      style: 'outline'
    },
    {
      label: 'Shop jerseys',
      description: 'Grab the latest green and gold kits.',
      href: 'https://shop.cricket.com.au/',
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
