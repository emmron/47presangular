import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
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
