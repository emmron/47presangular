import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EngagementBannerComponent } from './components/engagement-banner/engagement-banner.component';
import { ReferralService } from './services/referral.service';
import { ExperimentService } from './services/experiment.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, EngagementBannerComponent],
  template: `
    <main>
      <header class="site-header">
        <div class="branding">
          <span class="logo">47</span>
          <div>
            <h1>{{ heroCopy }}</h1>
            <p>Live intelligence on the Trump 47 campaign machine.</p>
          </div>
        </div>

        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/community" routerLinkActive="active">Community</a>
          <a routerLink="/premium" routerLinkActive="active">Premium</a>
        </nav>
      </header>

      <app-engagement-banner class="global-cta" [referralCode]="referralCode"></app-engagement-banner>

      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly heroCopy: string;

  constructor(
    private referrals: ReferralService,
    experiment: ExperimentService,
  ) {
    this.heroCopy = experiment.assignVariant('hero_messaging', [
      { id: 'momentum', weight: 50, copy: 'Keep the momentum surging' },
      { id: 'ground-game', weight: 30, copy: 'Deploy the ground game faster' },
      { id: 'data-lead', weight: 20, copy: 'Own the data advantage' },
    ]).copy;
  }

  get referralCode(): string {
    return this.referrals.getReferralCode();
  }
}
