import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';
import { RecommendedFeedComponent } from './components/recommended-feed/recommended-feed.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NewsFeedComponent, RecommendedFeedComponent],
  template: `
    <main class="app-layout">
      <section class="app-layout__sidebar">
        <app-recommended-feed></app-recommended-feed>
      </section>
      <section class="app-layout__content">
        <app-news-feed></app-news-feed>
      </section>
    </main>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      background: #f0f2f5;
      padding: 32px;
      display: grid;
      grid-template-columns: minmax(260px, 360px) 1fr;
      gap: 24px;
    }

    .app-layout__sidebar {
      position: sticky;
      top: 32px;
      align-self: start;
    }

    .app-layout__content {
      min-width: 0;
    }

    @media (max-width: 1024px) {
      .app-layout {
        grid-template-columns: 1fr;
        padding: 16px;
      }

      .app-layout__sidebar {
        position: static;
      }
    }
  `]
})
export class AppComponent {
  title = 'Trump 47 Campaign Tracker';
}
