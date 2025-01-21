import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NewsFeedComponent],
  template: `
    <main>
      <app-news-feed></app-news-feed>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
      background: #f0f2f5;
      padding: 20px 0;
    }
  `]
})
export class AppComponent {
  title = 'Trump 47 Campaign Tracker';
}
