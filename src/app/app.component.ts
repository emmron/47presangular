import { Component } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';
import { LayoutModule } from './layout/layout.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <main class="app-shell">
      <header class="app-header">
        <div class="branding">
          <h1>Trump 47 Campaign Tracker</h1>
          <p class="tagline">Tracking momentum across narratives, events, and daily coverage.</p>
        </div>
        <nav class="primary-nav">
          <a routerLink="/timeline" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Timeline</a>
          <a routerLink="/news" routerLinkActive="active">Live feed</a>
        </nav>
      </header>
      <section class="app-content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: linear-gradient(180deg, #f8f9fa 0%, #edf2ff 100%);
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #212529;
      }

      .app-shell {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1.25rem 4rem;
      }

      .app-header {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .branding h1 {
        margin: 0;
        font-size: 1.75rem;
      }

      .branding .tagline {
        margin: 0.5rem 0 0;
        color: #495057;
        font-size: 1rem;
      }

      .primary-nav {
        display: flex;
        gap: 1.25rem;
      }

      .primary-nav a {
        text-decoration: none;
        color: #495057;
        font-weight: 600;
        position: relative;
        padding-bottom: 0.25rem;
      }

      .primary-nav a.active,
      .primary-nav a:hover,
      .primary-nav a:focus {
        color: #4c6ef5;
      }

      .primary-nav a.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -0.35rem;
        height: 3px;
        border-radius: 999px;
        background: #4c6ef5;
      }

      .app-content {
        margin-top: 2rem;
      }

      @media (min-width: 768px) {
        .app-header {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .branding {
          max-width: 640px;
        }
      }
    `
  ]
})
export class AppComponent {}
