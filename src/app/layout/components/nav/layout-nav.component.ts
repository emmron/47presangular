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
    { path: '', label: 'Overview', icon: 'dashboard' },
    { path: 'latest', label: 'Latest', icon: 'flash_on' },
    { path: 'timeline', label: 'Timeline', icon: 'timeline' },
    { path: 'issues', label: 'Focus Areas', icon: 'forum' },
    { path: 'media', label: 'Media', icon: 'play_circle' }
  ];

  constructor(private router: Router) {}

  isActive(link: NavLink): boolean {
    const current = this.router.url.replace(/^\//, '');
    return current === link.path;
  }
}
