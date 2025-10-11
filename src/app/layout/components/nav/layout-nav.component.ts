import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-layout-nav',
  templateUrl: './layout-nav.component.html',
  styleUrls: ['./layout-nav.component.scss']
})
export class LayoutNavComponent {
  links: NavLink[] = [
    { path: '', label: 'Home', icon: 'dashboard' },
    { path: 'latest', label: 'Latest news', icon: 'flash_on' },
    { path: 'timeline', label: 'Storylines', icon: 'timeline' },
    { path: 'issues', label: 'League guides', icon: 'forum' },
    { path: 'media', label: 'Media hub', icon: 'play_circle' }
  ];

  constructor(private router: Router) {}

  isActive(link: NavLink): boolean {
    const current = this.router.url.replace(/^\//, '');
    return current === link.path;
  }
}
