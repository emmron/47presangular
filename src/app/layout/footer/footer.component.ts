import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  readonly navLinks = [
    { label: 'Latest News', route: '/news' },
    { label: 'Storylines', route: '/timeline' },
    { label: 'League Guides', route: '/issues' },
    { label: 'Stats Hub', route: '/dashboard' },
    { label: 'Fixtures', route: '/events' },
    { label: 'Fan Zone', route: '/get-involved' }
  ];

  currentYear = new Date().getFullYear();
}
