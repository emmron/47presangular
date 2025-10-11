import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="container">
          <a routerLink="/" class="brand" aria-label="Trump 47 Campaign Tracker home">
            Trump 47 Campaign Tracker
          </a>
          <p class="tagline">Realtime updates, context, and analysis on campaign developments.</p>
        </div>
      </header>
      <main class="app-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--background);
    }

    .app-header {
      background: linear-gradient(135deg, rgba(255, 69, 0, 0.95), rgba(255, 107, 61, 0.95));
      padding: 32px 0;
      color: #fff;
      box-shadow: 0 10px 30px rgba(255, 69, 0, 0.2);
    }

    .brand {
      font-size: clamp(1.6rem, 4vw, 2.2rem);
      font-weight: 700;
      color: inherit;
      text-decoration: none;
    }

    .tagline {
      margin-top: 8px;
      max-width: 640px;
      font-size: 1rem;
      opacity: 0.85;
    }

    .app-main {
      flex: 1;
      padding: 32px 0 64px;
    }

    @media (max-width: 768px) {
      .app-header {
        padding: 24px 0;
      }

      .app-main {
        padding: 24px 0 48px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Trump 47 Campaign Tracker';
}
