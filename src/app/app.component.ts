import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';
import { LiveStreamWidgetComponent } from './components/media/live-stream-widget/live-stream-widget.component';
import { AdSpotlightComponent } from './components/media/ad-spotlight/ad-spotlight.component';
import { EventMapComponent } from './components/media/event-map/event-map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NewsFeedComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, CommonModule, NewsFeedComponent, LiveStreamWidgetComponent, AdSpotlightComponent, EventMapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  imports: [ShellComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <main class="app-shell">
      <header class="app-header">
        <div class="branding">
          <h1>Trump 47 Campaign Tracker</h1>
          <p>Personalize your daily campaign intelligence briefings.</p>
        </div>
        <nav>
          <a routerLink="/news" routerLinkActive="active">News Feed</a>
          <a routerLink="/profile" routerLinkActive="active">My Profile</a>
        </nav>
        <div class="auth">
          <ng-container *ngIf="user$ | async as user; else guest">
            <span class="welcome">Welcome, {{ user.displayName || user.email }}</span>
            <button type="button" (click)="logout()">Log out</button>
          </ng-container>
          <ng-template #guest>
            <a routerLink="/login" class="login-link">Sign in</a>
          </ng-template>
        </div>
      </header>

      <section class="content">
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
  styles: [`
    .app-shell {
      min-height: 100vh;
      background: #f0f2f5;
      padding-bottom: 40px;
    }

    .app-header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 24px;
      align-items: center;
      padding: 24px clamp(16px, 5vw, 48px) 16px;
    }

    .branding h1 {
      margin: 0;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
    }

    .branding p {
      margin: 4px 0 0;
      color: #64748b;
      max-width: 540px;
    }

    nav {
      display: flex;
      gap: 16px;
    }

    nav a {
      text-decoration: none;
      font-weight: 600;
      color: #1f2937;
      padding-bottom: 4px;
      border-bottom: 2px solid transparent;
    }

    nav a.active {
      border-color: #2563eb;
      color: #2563eb;
    }

    .auth {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .welcome {
      font-weight: 500;
      color: #1f2937;
    }

    .auth button {
      padding: 8px 14px;
      border-radius: 8px;
      border: none;
      background: #ef4444;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    .login-link {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
    }

    .content {
      padding: 0 clamp(16px, 6vw, 64px);
    }

    @media (max-width: 900px) {
      .app-header {
        grid-template-columns: 1fr;
        align-items: flex-start;
      }

      nav {
        order: 3;
      }

      .auth {
        order: 2;
        justify-content: flex-start;
      }
    }
  `]
})
export class AppComponent {
  user$ = this.authService.user$;

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
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
