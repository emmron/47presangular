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
    { label: 'News', route: '/news' },
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Focus Areas', route: '/issues' },
    { label: 'Fixtures', route: '/events' },
    { label: 'Get Involved', route: '/get-involved' }
  ];

  currentYear = new Date().getFullYear();
}
